import streamlit as st
import re
import os
from PIL import Image
import io
import base64
from assets.default_profile.user_avatar import get_default_avatar

def show_profile():
    st.image("assets/badge.png", width=150)
    st.title("My Profile")
    
    # Initialize user data if not already in session state
    if "user_data" not in st.session_state:
        st.session_state.user_data = {}
    
    # Get current user data
    user_data = st.session_state.user_data
    
    # Profile picture
    st.subheader("Profile Picture")
    
    col1, col2 = st.columns([1, 3])
    
    with col1:
        # Display current profile picture if it exists
        if "profile_picture" in user_data:
            try:
                # Decode the base64 image data
                image_data = base64.b64decode(user_data["profile_picture"])
                profile_image = Image.open(io.BytesIO(image_data))
                st.image(profile_image, width=150, caption="Current Profile Picture")
            except Exception as e:
                st.error(f"Error displaying profile picture: {e}")
        else:
            # Generate a default avatar based on user's name
            first_name = user_data.get("first_name", "")
            last_name = user_data.get("last_name", "")
            full_name = f"{first_name} {last_name}".strip()
            
            if full_name:
                # Generate avatar with user's initials
                img_str = get_default_avatar(full_name)
                st.image(f"data:image/png;base64,{img_str}", width=150, caption="Default Avatar")
            else:
                # Use university badge as default if no name is provided
                st.image("assets/badge.png", width=150, caption="Default Profile Picture")
    
    with col2:
        # Upload new profile picture
        uploaded_file = st.file_uploader("Upload New Profile Picture", type=["jpg", "jpeg", "png"])
        if uploaded_file is not None:
            try:
                # Open and resize the image to a reasonable size
                image = Image.open(uploaded_file)
                max_size = (300, 300)
                image.thumbnail(max_size)
                
                # Convert to bytes and then to base64 for storage
                img_byte_arr = io.BytesIO()
                image.save(img_byte_arr, format=image.format if image.format else 'PNG')
                img_byte_arr = img_byte_arr.getvalue()
                img_base64 = base64.b64encode(img_byte_arr).decode('utf-8')
                
                # Display the uploaded image
                st.image(image, width=150, caption="New Profile Picture")
                
                # Store the base64 image data in session state
                user_data["profile_picture"] = img_base64
                st.success("Profile picture uploaded successfully!")
            except Exception as e:
                st.error(f"Error uploading profile picture: {e}")
    
    # Personal details
    st.subheader("Personal Information")
    
    col1, col2 = st.columns(2)
    
    with col1:
        first_name = st.text_input("First Name", value=user_data.get("first_name", ""))
        department = st.text_input("Department", value=user_data.get("department", ""))
        role = st.selectbox(
            "Role",
            options=["Student", "Professor", "Lab Assistant", "Administrator", "Other"],
            index=["Student", "Professor", "Lab Assistant", "Administrator", "Other"].index(user_data.get("role", "Student")) if "role" in user_data else 0
        )
    
    with col2:
        last_name = st.text_input("Last Name", value=user_data.get("last_name", ""))
        student_id = st.text_input("Student/Staff ID", value=user_data.get("student_id", ""))
        phone = st.text_input("Phone Number", value=user_data.get("phone", ""))
    
    # About me section
    st.subheader("About Me")
    bio = st.text_area("Bio", value=user_data.get("bio", ""), height=150,
                      help="Tell us about yourself, your research interests, and experience.")
    
    # Academic information
    st.subheader("Academic Information")
    
    col1, col2 = st.columns(2)
    
    with col1:
        program = st.text_input("Program/Course", value=user_data.get("program", ""))
        
    with col2:
        year_of_study = st.selectbox(
            "Year of Study",
            options=["1", "2", "3", "4", "5", "6", "Not Applicable"],
            index=["1", "2", "3", "4", "5", "6", "Not Applicable"].index(user_data.get("year_of_study", "1")) if "year_of_study" in user_data else 0
        )
    
    # Skills and expertise
    st.subheader("Laboratory Skills & Expertise")
    skills = st.text_area("Skills", value=user_data.get("skills", ""), height=100,
                         help="List your laboratory skills and competencies")
    
    # Save profile button
    if st.button("Save Profile"):
        # Validate phone number if provided
        if phone and not re.match(r'^\+?[0-9]{10,15}$', phone):
            st.error("Please enter a valid phone number.")
        else:
            # Update user data in session state
            user_data.update({
                "first_name": first_name,
                "last_name": last_name,
                "department": department,
                "role": role,
                "student_id": student_id,
                "phone": phone,
                "bio": bio,
                "program": program,
                "year_of_study": year_of_study,
                "skills": skills
            })
            
            st.session_state.user_data = user_data
            st.success("Profile updated successfully!")
    
    # Display user bookings
    st.markdown("---")
    st.subheader("My Booking History")
    
    user_bookings = [b for b in st.session_state.booking_data if b["user_email"] == st.session_state.user_email]
    
    if not user_bookings:
        st.info("You haven't made any bookings yet.")
    else:
        # Group bookings by status
        confirmed = [b for b in user_bookings if b["status"] == "Confirmed"]
        completed = [b for b in user_bookings if b["status"] == "Completed"]
        cancelled = [b for b in user_bookings if b["status"] == "Cancelled"]
        
        tab1, tab2, tab3 = st.tabs(["Active", "Completed", "Cancelled"])
        
        with tab1:
            if not confirmed:
                st.info("No active bookings.")
            else:
                for booking in confirmed:
                    equipment = next((e for e in st.session_state.equipment_data if e["id"] == booking["equipment_id"]), None)
                    equipment_name = equipment["name"] if equipment else "Unknown Equipment"
                    
                    with st.expander(f"{equipment_name} - {booking['start_date']} to {booking['end_date']}"):
                        st.write(f"**Equipment:** {equipment_name}")
                        st.write(f"**Booking Period:** {booking['start_date']} to {booking['end_date']}")
                        st.write(f"**Status:** {booking['status']}")
                        if "purpose" in booking:
                            st.write(f"**Purpose:** {booking['purpose']}")
                        st.write(f"**Booked on:** {booking['timestamp']}")
        
        with tab2:
            if not completed:
                st.info("No completed bookings.")
            else:
                for booking in completed:
                    equipment = next((e for e in st.session_state.equipment_data if e["id"] == booking["equipment_id"]), None)
                    equipment_name = equipment["name"] if equipment else "Unknown Equipment"
                    
                    with st.expander(f"{equipment_name} - {booking['start_date']} to {booking['end_date']}"):
                        st.write(f"**Equipment:** {equipment_name}")
                        st.write(f"**Booking Period:** {booking['start_date']} to {booking['end_date']}")
                        st.write(f"**Status:** {booking['status']}")
                        if "purpose" in booking:
                            st.write(f"**Purpose:** {booking['purpose']}")
                        st.write(f"**Booked on:** {booking['timestamp']}")
        
        with tab3:
            if not cancelled:
                st.info("No cancelled bookings.")
            else:
                for booking in cancelled:
                    equipment = next((e for e in st.session_state.equipment_data if e["id"] == booking["equipment_id"]), None)
                    equipment_name = equipment["name"] if equipment else "Unknown Equipment"
                    
                    with st.expander(f"{equipment_name} - {booking['start_date']} to {booking['end_date']}"):
                        st.write(f"**Equipment:** {equipment_name}")
                        st.write(f"**Booking Period:** {booking['start_date']} to {booking['end_date']}")
                        st.write(f"**Status:** {booking['status']}")
                        if "purpose" in booking:
                            st.write(f"**Purpose:** {booking['purpose']}")
                        st.write(f"**Booked on:** {booking['timestamp']}")
