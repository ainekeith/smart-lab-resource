import streamlit as st
import pandas as pd
from streamlit_option_menu import option_menu
import re
import os
from PIL import Image, ImageDraw, ImageFont
import io
import base64
from datetime import datetime, timedelta
import random
from email_validator import validate_email, EmailNotValidError

# Page configuration
st.set_page_config(
    page_title="Soroti University Smart Lab",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ====================================================
# Database Functions
# ====================================================

# Initialize equipment data
def initialize_equipment():
    return [
        {
            "id": 1,
            "name": "Microscope - Olympus BX53",
            "description": "Advanced research microscope with brightfield and fluorescence capabilities",
            "category": "Microscopy",
            "location": "Lab Room 101",
            "status": "Available",
            "image_url": None
        },
        {
            "id": 2,
            "name": "Centrifuge - Eppendorf 5430R",
            "description": "Refrigerated centrifuge with multiple rotor options",
            "category": "Sample Preparation",
            "location": "Lab Room 102",
            "status": "Available",
            "image_url": None
        },
        {
            "id": 3,
            "name": "PCR Thermocycler - Bio-Rad C1000",
            "description": "Thermal cycler for DNA amplification",
            "category": "Molecular Biology",
            "location": "Lab Room 103",
            "status": "Available",
            "image_url": None
        },
        {
            "id": 4,
            "name": "Spectrophotometer - Thermo Scientific NanoDrop",
            "description": "UV-Vis spectrophotometer for nucleic acid and protein quantification",
            "category": "Analytical",
            "location": "Lab Room 104",
            "status": "Maintenance",
            "image_url": None
        },
        {
            "id": 5,
            "name": "HPLC System - Agilent 1260 Infinity",
            "description": "High-performance liquid chromatography system",
            "category": "Analytical",
            "location": "Lab Room 105",
            "status": "Available",
            "image_url": None
        },
        {
            "id": 6,
            "name": "Flow Cytometer - BD FACSCanto II",
            "description": "Cell analysis system for immunophenotyping",
            "category": "Cell Biology",
            "location": "Lab Room 106",
            "status": "Available",
            "image_url": None
        },
        {
            "id": 7,
            "name": "Electrophoresis System - Bio-Rad PowerPac",
            "description": "Gel electrophoresis for protein and nucleic acid separation",
            "category": "Molecular Biology",
            "location": "Lab Room 107",
            "status": "Available",
            "image_url": None
        },
        {
            "id": 8,
            "name": "Incubator - Thermo Scientific Heracell",
            "description": "CO2 incubator for cell culture",
            "category": "Cell Biology",
            "location": "Lab Room 108",
            "status": "Available",
            "image_url": None
        },
        {
            "id": 9,
            "name": "Autoclave - Tuttnauer 3870EA",
            "description": "Steam sterilizer for lab equipment and media",
            "category": "General Equipment",
            "location": "Lab Room 109",
            "status": "Available",
            "image_url": None
        },
        {
            "id": 10,
            "name": "Plate Reader - BioTek Synergy H1",
            "description": "Multimode microplate reader for absorbance, fluorescence, and luminescence",
            "category": "Analytical",
            "location": "Lab Room 110",
            "status": "Available",
            "image_url": None
        }
    ]

# User database functions
def get_user(email):
    """Get user data by email"""
    if "users" not in st.session_state:
        st.session_state.users = {}
    
    return st.session_state.users.get(email)

def add_user(email, password, user_data=None):
    """Add new user with category information"""
    if "users" not in st.session_state:
        st.session_state.users = {}
    
    user = {
        "email": email,
        "password": password,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Add additional user data if provided
    if user_data:
        user.update(user_data)
    
    st.session_state.users[email] = user
    
    return st.session_state.users[email]

def update_user(email, data):
    """Update user data"""
    if "users" not in st.session_state:
        st.session_state.users = {}
    
    if email in st.session_state.users:
        st.session_state.users[email].update(data)
        return st.session_state.users[email]
    
    return None

# Equipment database functions
def get_equipment(equipment_id):
    """Get equipment by ID"""
    for equipment in st.session_state.equipment_data:
        if equipment["id"] == equipment_id:
            return equipment
    return None

def update_equipment_status(equipment_id, status):
    """Update equipment status"""
    for i, equipment in enumerate(st.session_state.equipment_data):
        if equipment["id"] == equipment_id:
            st.session_state.equipment_data[i]["status"] = status
            return True
    return False

def add_equipment(name, description, category, location, status="Available", image_url=None):
    """Add new equipment"""
    new_id = max([item["id"] for item in st.session_state.equipment_data], default=0) + 1
    
    new_equipment = {
        "id": new_id,
        "name": name,
        "description": description,
        "category": category,
        "location": location,
        "status": status,
        "image_url": image_url
    }
    
    st.session_state.equipment_data.append(new_equipment)
    return new_equipment

def update_equipment(equipment_id, data):
    """Update equipment data"""
    for i, equipment in enumerate(st.session_state.equipment_data):
        if equipment["id"] == equipment_id:
            st.session_state.equipment_data[i].update(data)
            return st.session_state.equipment_data[i]
    return None

def delete_equipment(equipment_id):
    """Delete equipment by ID"""
    # Check if equipment is currently booked
    for booking in st.session_state.booking_data:
        if booking["equipment_id"] == equipment_id and booking["status"] == "Confirmed":
            return False, "Cannot delete equipment that is currently booked"
    
    # Remove equipment
    for i, equipment in enumerate(st.session_state.equipment_data):
        if equipment["id"] == equipment_id:
            del st.session_state.equipment_data[i]
            return True, f"Equipment with ID {equipment_id} deleted successfully"
    
    return False, f"Equipment with ID {equipment_id} not found"

# Booking database functions
def add_booking(user_email, equipment_id, start_date, end_date, purpose=""):
    """Add new booking"""
    if "booking_data" not in st.session_state:
        st.session_state.booking_data = []
    
    new_booking = {
        "id": len(st.session_state.booking_data) + 1,
        "user_email": user_email,
        "equipment_id": equipment_id,
        "start_date": start_date.strftime("%Y-%m-%d") if isinstance(start_date, datetime) else start_date,
        "end_date": end_date.strftime("%Y-%m-%d") if isinstance(end_date, datetime) else end_date,
        "purpose": purpose,
        "status": "Confirmed",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    st.session_state.booking_data.append(new_booking)
    
    # Update equipment status
    update_equipment_status(equipment_id, "Booked")
    
    return new_booking

def update_booking_status(booking_id, status):
    """Update booking status"""
    for i, booking in enumerate(st.session_state.booking_data):
        if booking["id"] == booking_id:
            st.session_state.booking_data[i]["status"] = status
            
            # If cancelled, update equipment status back to Available
            if status == "Cancelled":
                equipment_id = booking["equipment_id"]
                update_equipment_status(equipment_id, "Available")
            
            return True
    return False

def get_user_bookings(user_email):
    """Get all bookings for a user"""
    if "booking_data" not in st.session_state:
        st.session_state.booking_data = []
    
    return [b for b in st.session_state.booking_data if b["user_email"] == user_email]

# ====================================================
# Utility Functions
# ====================================================

def is_valid_email(email):
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False

def display_success(message):
    """Display success message with formatting"""
    st.success(message)

def display_error(message):
    """Display error message with formatting"""
    st.error(message)

def display_info(message):
    """Display info message with formatting"""
    st.info(message)

def validate_date_range(start_date, end_date):
    """Validate that end date is after start date"""
    if start_date > end_date:
        return False
    return True

def check_booking_conflict(equipment_id, start_date, end_date, booking_data, exclude_booking_id=None):
    """
    Check if there's a booking conflict
    Returns True if there is a conflict, False otherwise
    """
    for booking in booking_data:
        if booking["equipment_id"] == equipment_id:
            # Skip the booking being edited
            if exclude_booking_id and booking["id"] == exclude_booking_id:
                continue
                
            booking_start = datetime.strptime(booking["start_date"], "%Y-%m-%d")
            booking_end = datetime.strptime(booking["end_date"], "%Y-%m-%d")
            
            # Check for overlap
            if (start_date <= booking_end.date() and end_date >= booking_start.date() and
                booking["status"] == "Confirmed"):
                return True
    
    return False

def get_upcoming_bookings(user_email, booking_data, days=7):
    """Get upcoming bookings within the specified number of days"""
    now = datetime.now().date()
    end_date = now + timedelta(days=days)
    
    upcoming = []
    for booking in booking_data:
        if booking["user_email"] == user_email and booking["status"] == "Confirmed":
            booking_start = datetime.strptime(booking["start_date"], "%Y-%m-%d").date()
            booking_end = datetime.strptime(booking["end_date"], "%Y-%m-%d").date()
            
            # Check if booking is upcoming
            if booking_end >= now and booking_start <= end_date:
                upcoming.append(booking)
    
    return upcoming

def get_equipment_availability(equipment_id, booking_data, days=30):
    """
    Get availability of equipment for the next n days
    Returns a list of dates when the equipment is booked
    """
    now = datetime.now().date()
    end_date = now + timedelta(days=days)
    
    booked_dates = []
    for booking in booking_data:
        if booking["equipment_id"] == equipment_id and booking["status"] == "Confirmed":
            booking_start = datetime.strptime(booking["start_date"], "%Y-%m-%d").date()
            booking_end = datetime.strptime(booking["end_date"], "%Y-%m-%d").date()
            
            # Add all dates from start to end
            current = max(booking_start, now)
            while current <= min(booking_end, end_date):
                booked_dates.append(current)
                current += timedelta(days=1)
    
    return booked_dates

def filter_equipment(equipment_list, category=None, status=None, search_term=None):
    """Filter equipment by category, status and search term"""
    filtered = equipment_list
    
    if category and category != "All":
        filtered = [e for e in filtered if e["category"] == category]
    
    if status and status != "All":
        filtered = [e for e in filtered if e["status"] == status]
    
    if search_term:
        search_term = search_term.lower()
        filtered = [e for e in filtered if search_term in e["name"].lower() or 
                   (e["description"] and search_term in e["description"].lower()) or
                   (e["category"] and search_term in e["category"].lower()) or
                   (e["location"] and search_term in e["location"].lower())]
    
    return filtered

def generate_avatar(initials, size=(200, 200), background_color=None):
    """
    Generate a simple avatar with user's initials
    
    Args:
        initials (str): User's initials (1-2 characters)
        size (tuple): Image size (width, height)
        background_color (tuple): RGB color tuple or None for random color
    
    Returns:
        PIL.Image: Avatar image
    """
    if not background_color:
        # Generate a random color in coffee brown shades
        coffee_colors = [
            (111, 78, 55),    # Dark coffee
            (131, 94, 57),    # Medium coffee 
            (158, 103, 63),   # Light coffee
            (173, 114, 67),   # Tan
            (185, 141, 101),  # Beige
        ]
        background_color = random.choice(coffee_colors)
    
    # Create a new image with the given background color
    img = Image.new('RGB', size, color=background_color)
    draw = ImageDraw.Draw(img)
    
    # Calculate font size (approximately half the image width)
    font_size = int(size[0] * 0.5)
    
    try:
        # Try to use a system font
        font = ImageFont.truetype("Arial", font_size)
    except IOError:
        # If the font is not available, use the default font
        font = ImageFont.load_default()
    
    # Get text size - this varies by PIL version
    try:
        # Newer versions of PIL
        text_width, text_height = draw.textbbox((0, 0), initials, font=font)[2:4]
    except AttributeError:
        # Older versions of PIL
        text_width, text_height = draw.textsize(initials, font=font)
    position = ((size[0] - text_width) / 2, (size[1] - text_height) / 2 - font_size * 0.1)
    
    # Draw the text
    draw.text(position, initials, fill=(255, 255, 255), font=font)
    
    return img

def get_default_avatar(name="User"):
    """
    Generate a default avatar based on the user's name
    
    Args:
        name (str): User's name
    
    Returns:
        str: Base64 encoded avatar image
    """
    # Generate initials from the name
    parts = name.strip().split()
    if len(parts) >= 2:
        initials = parts[0][0].upper() + parts[-1][0].upper()
    elif len(parts) == 1 and parts[0]:
        initials = parts[0][0].upper()
    else:
        initials = "U"  # Default for "User"
    
    # Generate avatar image
    avatar = generate_avatar(initials)
    
    # Convert to base64
    buffered = io.BytesIO()
    avatar.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return img_str

# ====================================================
# Page Components
# ====================================================

def display_badge():
    col1, col2 = st.columns([1, 3])
    with col1:
        st.image("assets/badge.png", width=150)
    with col2:
        st.markdown("<h1 style='margin-bottom:0;'>SOROTI UNIVERSITY</h1>", unsafe_allow_html=True)
        st.markdown("<h2 style='margin-top:0;'>Smart Lab Resource Management System</h2>", unsafe_allow_html=True)
    st.markdown("---")

def logout():
    st.session_state.logged_in = False
    st.session_state.user_email = ""
    st.session_state.user_data = {}

def show_auth_page():
    tab1, tab2 = st.tabs(["Login", "Register"])
    
    with tab1:
        st.header("Login")
        email = st.text_input("Email Address", key="login_email")
        password = st.text_input("Password", type="password", key="login_password")
        
        if st.button("Login", key="login_button"):
            if not email or not password:
                st.error("Please enter both email and password")
            elif not is_valid_email(email):
                st.error("Please enter a valid email address")
            else:
                user = get_user(email)
                if user and user["password"] == password:
                    st.success("Login successful!")
                    st.session_state.logged_in = True
                    st.session_state.user_email = email
                    st.session_state.user_data = user
                    st.rerun()
                else:
                    st.error("Invalid email or password")
    
    with tab2:
        st.header("Register")
        new_email = st.text_input("Email Address", key="register_email")
        new_password = st.text_input("Password", type="password", key="register_password")
        confirm_password = st.text_input("Confirm Password", type="password", key="confirm_password")
        
        # User category selection
        st.subheader("User Category")
        user_category = st.selectbox(
            "Select your category",
            options=["Student", "Lecturer", "Lab Technician"],
            index=0,
            key="user_category"
        )
        
        # Additional fields based on category
        if user_category == "Student":
            student_id = st.text_input("Student ID", key="student_id")
            department = st.text_input("Department", key="student_department")
            year_of_study = st.selectbox(
                "Year of Study",
                options=["1", "2", "3", "4", "5", "6"],
                index=0,
                key="year_of_study"
            )
            
        elif user_category == "Lecturer":
            staff_id = st.text_input("Staff ID", key="staff_id")
            department = st.text_input("Department", key="lecturer_department")
            
        elif user_category == "Lab Technician":
            staff_id = st.text_input("Staff ID", key="tech_staff_id")
            lab_section = st.text_input("Lab Section", key="lab_section")
            
        if st.button("Register", key="register_button"):
            if not new_email or not new_password or not confirm_password:
                st.error("Please fill in all required fields")
            elif not is_valid_email(new_email):
                st.error("Please enter a valid email address")
            elif new_password != confirm_password:
                st.error("Passwords do not match")
            elif get_user(new_email):
                st.error("Email already registered")
            else:
                # Create user data with category information
                user_data = {
                    "user_category": user_category,
                }
                
                # Add category-specific information
                if user_category == "Student":
                    if not student_id:
                        st.error("Please enter your Student ID")
                        return
                    user_data.update({
                        "student_id": student_id,
                        "department": department,
                        "year_of_study": year_of_study
                    })
                elif user_category == "Lecturer":
                    if not staff_id:
                        st.error("Please enter your Staff ID")
                        return
                    user_data.update({
                        "staff_id": staff_id,
                        "department": department
                    })
                elif user_category == "Lab Technician":
                    if not staff_id:
                        st.error("Please enter your Staff ID")
                        return
                    user_data.update({
                        "staff_id": staff_id,
                        "lab_section": lab_section,
                        "is_admin": True  # Lab technicians have admin privileges
                    })
                
                # Add the user to the database
                add_user(new_email, new_password, user_data)
                st.success("Registration successful! Please login.")

def show_dashboard():
    col1, col2 = st.columns([1, 3])
    with col1:
        st.image("assets/badge.png", width=150)
    with col2:
        st.markdown("<h1 style='margin-bottom:0;'>SOROTI UNIVERSITY</h1>", unsafe_allow_html=True)
        st.markdown("<h2 style='margin-top:0;'>Smart Lab Dashboard</h2>", unsafe_allow_html=True)
    st.markdown("### Welcome to the Smart Lab Resource Management System")
    
    # Summary statistics
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric(label="Total Equipment", value=len(st.session_state.equipment_data))
    
    with col2:
        available_count = sum(1 for item in st.session_state.equipment_data if item["status"] == "Available")
        st.metric(label="Available Equipment", value=available_count)
    
    with col3:
        user_bookings = [b for b in st.session_state.booking_data if b["user_email"] == st.session_state.user_email]
        st.metric(label="My Bookings", value=len(user_bookings))
    
    # Recent bookings
    st.subheader("My Recent Bookings")
    if user_bookings:
        # Sort bookings by date (newest first)
        user_bookings.sort(key=lambda x: datetime.strptime(x["start_date"], "%Y-%m-%d"), reverse=True)
        
        # Display the most recent 5 bookings
        recent_bookings = user_bookings[:5]
        booking_data = []
        
        for b in recent_bookings:
            equipment = next((e for e in st.session_state.equipment_data if e["id"] == b["equipment_id"]), None)
            equipment_name = equipment["name"] if equipment else "Unknown"
            booking_data.append({
                "Equipment": equipment_name,
                "Start Date": b["start_date"],
                "End Date": b["end_date"],
                "Status": b["status"]
            })
        
        df = pd.DataFrame(booking_data)
        st.dataframe(df, use_container_width=True)
        
        if st.button("Book More Equipment"):
            st.session_state.current_page = "booking"
            st.rerun()
    else:
        st.info("You haven't made any bookings yet.")
        if st.button("Book Equipment Now"):
            st.session_state.current_page = "booking"
            st.rerun()
    
    # Available equipment
    st.subheader("Available Equipment")
    available_equipment = [e for e in st.session_state.equipment_data if e["status"] == "Available"]
    
    if available_equipment:
        equipment_data = []
        for e in available_equipment:
            equipment_data.append({
                "Name": e["name"],
                "Category": e["category"],
                "Location": e["location"]
            })
        
        df = pd.DataFrame(equipment_data)
        st.dataframe(df, use_container_width=True)
        
        if st.button("View All Equipment"):
            st.session_state.current_page = "booking"
            st.rerun()
    else:
        st.info("No equipment is currently available.")
    
    # Quick booking section
    st.subheader("Quick Book Equipment")
    
    # Show only available equipment
    equipment_options = [e["name"] for e in st.session_state.equipment_data if e["status"] == "Available"]
    
    if equipment_options:
        selected_equipment = st.selectbox("Select Equipment", options=equipment_options)
        
        col1, col2 = st.columns(2)
        with col1:
            start_date = st.date_input("Start Date", min_value=datetime.today())
        with col2:
            end_date = st.date_input("End Date", min_value=start_date, value=start_date + timedelta(days=1))
        
        if st.button("Book Now"):
            # Find the equipment id
            equipment = next((e for e in st.session_state.equipment_data if e["name"] == selected_equipment), None)
            
            if equipment:
                # Check for booking conflicts
                conflict = False
                for booking in st.session_state.booking_data:
                    if booking["equipment_id"] == equipment["id"]:
                        booking_start = datetime.strptime(booking["start_date"], "%Y-%m-%d")
                        booking_end = datetime.strptime(booking["end_date"], "%Y-%m-%d")
                        
                        if (start_date <= booking_end.date() and end_date >= booking_start.date()):
                            conflict = True
                            break
                
                if conflict:
                    st.error("This equipment is already booked for the selected dates.")
                else:
                    new_booking = {
                        "id": len(st.session_state.booking_data) + 1,
                        "user_email": st.session_state.user_email,
                        "equipment_id": equipment["id"],
                        "start_date": start_date.strftime("%Y-%m-%d"),
                        "end_date": end_date.strftime("%Y-%m-%d"),
                        "status": "Confirmed",
                        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                    
                    # Update equipment status
                    for i, equip in enumerate(st.session_state.equipment_data):
                        if equip["id"] == equipment["id"]:
                            st.session_state.equipment_data[i]["status"] = "Booked"
                            break
                    
                    st.session_state.booking_data.append(new_booking)
                    st.success(f"Successfully booked {selected_equipment} from {start_date} to {end_date}")
                    st.rerun()
    else:
        st.warning("No equipment is currently available for booking.")

def show_booking_page():
    col1, col2 = st.columns([1, 3])
    with col1:
        st.image("assets/badge.png", width=150)
    with col2:
        st.markdown("<h1 style='margin-bottom:0;'>SOROTI UNIVERSITY</h1>", unsafe_allow_html=True)
        st.markdown("<h2 style='margin-top:0;'>Resource Booking</h2>", unsafe_allow_html=True)
    
    # Create tabs for equipment booking and lab session booking
    booking_type = st.radio(
        "Booking Type",
        options=["Equipment Booking", "Lab Session Booking"],
        horizontal=True
    )
    
    # Import the Java bridge for time slots
    from java_bridge import get_java_bridge
    
    # Use Python fallback for generating time slots
    def generate_time_slots(start_hour=8, end_hour=18, interval=30):
        from datetime import datetime, timedelta
        
        time_slots = []
        current_time = datetime.strptime(f"{start_hour}:00", "%H:%M")
        end_time = datetime.strptime(f"{end_hour}:00", "%H:%M")
        
        while current_time <= end_time:
            time_slots.append(current_time.strftime("%H:%M"))
            current_time += timedelta(minutes=interval)
            
        return time_slots
    
    # Try to use Java bridge if available
    try:
        java_bridge = get_java_bridge()
        # Test the Java bridge with a simple call
        test_slots = java_bridge.generate_time_slots(8, 9, 30)
        if test_slots and len(test_slots) > 0:
            # Java bridge is working
            pass
        else:
            # Fallback to Python implementation
            java_bridge = None
    except Exception as e:
        print(f"Error loading Java bridge: {str(e)}")
        java_bridge = None
        
    if booking_type == "Lab Session Booking":
        st.header("Lab Session Booking")
        
        # Check if user is a lab assistant
        is_lab_assistant = st.session_state.user_data.get("user_category") == "Lab Technician"
        
        if is_lab_assistant:
            st.subheader("Create Lab Session")
            
            # Create a new lab session
            with st.form("create_lab_session"):
                session_name = st.text_input("Session Name")
                lab_room = st.selectbox(
                    "Lab Room",
                    options=["Lab Room 101", "Lab Room 102", "Lab Room 103", "Lab Room 104", "Lab Room 105"]
                )
                
                date = st.date_input("Session Date", min_value=datetime.today())
                
                col1, col2 = st.columns(2)
                with col1:
                    # Get Java-powered time slots
                    if java_bridge:
                        start_slots = java_bridge.generate_time_slots(8, 17, 30)
                        start_time = st.selectbox("Start Time", options=start_slots)
                    else:
                        start_time = st.time_input("Start Time", value=datetime.strptime("08:00", "%H:%M").time())
                
                with col2:
                    if java_bridge:
                        end_slots = java_bridge.generate_time_slots(9, 18, 30)
                        end_time = st.selectbox("End Time", options=end_slots)
                    else:
                        end_time = st.time_input("End Time", value=datetime.strptime("10:00", "%H:%M").time())
                
                capacity = st.number_input("Maximum Capacity", min_value=1, max_value=100, value=30)
                description = st.text_area("Session Description")
                
                submit = st.form_submit_button("Create Lab Session")
                
                if submit:
                    if not session_name:
                        st.error("Session name is required")
                    elif not description:
                        st.error("Session description is required")
                    else:
                        # Check if the lab session already exists in that time slot
                        if "lab_sessions" not in st.session_state:
                            st.session_state.lab_sessions = []
                        
                        # Convert times to string format for comparison
                        if isinstance(start_time, str):
                            start_time_str = start_time
                        else:
                            start_time_str = start_time.strftime("%H:%M")
                            
                        if isinstance(end_time, str):
                            end_time_str = end_time
                        else:
                            end_time_str = end_time.strftime("%H:%M")
                        
                        # Check for conflicts
                        conflict = False
                        for session in st.session_state.lab_sessions:
                            if session["lab_room"] == lab_room and session["date"] == date.strftime("%Y-%m-%d"):
                                session_start = session["start_time"]
                                session_end = session["end_time"]
                                
                                # Check if time periods overlap
                                if (start_time_str <= session_end and end_time_str >= session_start):
                                    conflict = True
                                    break
                        
                        if conflict:
                            st.error("There's already a lab session scheduled for this time slot in this room.")
                        else:
                            # Create the lab session
                            new_session = {
                                "id": len(st.session_state.lab_sessions) + 1,
                                "name": session_name,
                                "lab_room": lab_room,
                                "date": date.strftime("%Y-%m-%d"),
                                "start_time": start_time_str,
                                "end_time": end_time_str,
                                "capacity": capacity,
                                "description": description,
                                "created_by": st.session_state.user_email,
                                "participants": [],
                                "status": "Open"
                            }
                            
                            st.session_state.lab_sessions.append(new_session)
                            st.success(f"Created lab session: {session_name}")
                            st.rerun()
            
        # Display available lab sessions (for all users)
        st.subheader("Available Lab Sessions")
        
        if "lab_sessions" not in st.session_state or not st.session_state.lab_sessions:
            st.info("No lab sessions available. Please check back later.")
        else:
            # Filter to show only future sessions and with Open status
            today = datetime.today().date()
            open_sessions = []
            
            for session in st.session_state.lab_sessions:
                session_date = datetime.strptime(session["date"], "%Y-%m-%d").date()
                if session_date >= today and session["status"] == "Open":
                    open_sessions.append(session)
            
            if not open_sessions:
                st.info("No upcoming lab sessions available.")
            else:
                # Display as cards
                for session in open_sessions:
                    with st.expander(f"{session['name']} - {session['date']} ({session['start_time']} to {session['end_time']})"):
                        st.write(f"**Lab Room:** {session['lab_room']}")
                        st.write(f"**Date:** {session['date']}")
                        st.write(f"**Time:** {session['start_time']} to {session['end_time']}")
                        st.write(f"**Capacity:** {len(session['participants'])}/{session['capacity']}")
                        st.write(f"**Description:** {session['description']}")
                        
                        # Check if user is already registered
                        user_registered = st.session_state.user_email in session["participants"]
                        
                        if user_registered:
                            st.success("You are registered for this session")
                            if st.button(f"Cancel Registration #{session['id']}", key=f"cancel_{session['id']}"):
                                # Remove user from participants
                                session["participants"].remove(st.session_state.user_email)
                                st.success("Registration cancelled successfully")
                                st.rerun()
                        elif len(session["participants"]) < session["capacity"]:
                            if st.button(f"Register #{session['id']}", key=f"register_{session['id']}"):
                                # Add user to participants
                                session["participants"].append(st.session_state.user_email)
                                st.success("Registered successfully")
                                st.rerun()
                        else:
                            st.error("This session is at full capacity")
        
        # Lab session management for lab assistants
        if is_lab_assistant:
            st.subheader("Manage Lab Sessions")
            
            if "lab_sessions" not in st.session_state or not st.session_state.lab_sessions:
                st.info("No lab sessions to manage.")
            else:
                # Filter to show only sessions created by this lab assistant
                my_sessions = [s for s in st.session_state.lab_sessions if s["created_by"] == st.session_state.user_email]
                
                if not my_sessions:
                    st.info("You haven't created any lab sessions yet.")
                else:
                    for session in my_sessions:
                        with st.expander(f"{session['name']} - {session['date']} ({session['start_time']} to {session['end_time']})"):
                            st.write(f"**Status:** {session['status']}")
                            st.write(f"**Participants:** {len(session['participants'])}/{session['capacity']}")
                            
                            # Display participants
                            if session['participants']:
                                st.write("**Participants List:**")
                                for i, participant in enumerate(session['participants']):
                                    st.write(f"{i+1}. {participant}")
                            
                            # Cancel or close session option
                            col1, col2 = st.columns(2)
                            with col1:
                                if session["status"] == "Open":
                                    if st.button(f"Close Registration #{session['id']}", key=f"close_{session['id']}"):
                                        session["status"] = "Closed"
                                        st.success("Session registration closed")
                                        st.rerun()
                                else:
                                    if st.button(f"Reopen Registration #{session['id']}", key=f"reopen_{session['id']}"):
                                        session["status"] = "Open"
                                        st.success("Session registration reopened")
                                        st.rerun()
                            
                            with col2:
                                if st.button(f"Cancel Session #{session['id']}", key=f"delete_{session['id']}"):
                                    # Remove session from list
                                    st.session_state.lab_sessions.remove(session)
                                    st.success("Session cancelled")
                                    st.rerun()
    
    # Only show equipment booking tab if that's selected
    if booking_type == "Equipment Booking":
        st.header("Equipment Booking")
        
        # Filters
        st.sidebar.header("Filters")
        
        # Get unique categories
        categories = set(e["category"] for e in st.session_state.equipment_data)
        category_filter = st.sidebar.selectbox(
            "Category",
            ["All"] + sorted(list(categories))
        )
        
        status_filter = st.sidebar.selectbox(
            "Status",
            ["All", "Available", "Booked", "Maintenance"]
        )
        
        search_term = st.sidebar.text_input("Search Equipment")
    
        # Filter equipment based on criteria
        filtered_equipment = filter_equipment(
            st.session_state.equipment_data,
            category_filter,
            status_filter,
            search_term
        )
    
        # Display equipment
        if not filtered_equipment:
            st.info("No equipment found matching your criteria.")
        else:
            st.subheader(f"Equipment List ({len(filtered_equipment)} items)")
            
            # Convert to DataFrame for better display
            equipment_data = []
            for e in filtered_equipment:
                equipment_data.append({
                    "ID": e["id"],
                    "Name": e["name"],
                    "Category": e["category"],
                    "Location": e["location"],
                    "Status": e["status"]
                })
            
            df = pd.DataFrame(equipment_data)
            st.dataframe(df, use_container_width=True)
        
        # Equipment selection for booking
        st.subheader("Book Equipment")
        
        # Only allow booking available equipment
        available_equipment = [e for e in filtered_equipment if e["status"] == "Available"]
        
        if not available_equipment:
            st.warning("No equipment is currently available for booking.")
        else:
            equipment_options = {f"{e['id']}: {e['name']}" for e in available_equipment}
            selected_equipment = st.selectbox(
                "Select Equipment to Book",
                options=sorted(list(equipment_options))
            )
            
            # Extract equipment ID from selection
            equipment_id = int(selected_equipment.split(":")[0])
            
            # Get the selected equipment details
            equipment = next((e for e in available_equipment if e["id"] == equipment_id), None)
            
            if equipment:
                st.write(f"**Selected Equipment:** {equipment['name']}")
                st.write(f"**Description:** {equipment['description']}")
                st.write(f"**Location:** {equipment['location']}")
                
                # Date selection
                col1, col2 = st.columns(2)
                with col1:
                    start_date = st.date_input(
                        "Start Date",
                        min_value=datetime.today(),
                        value=datetime.today()
                    )
                with col2:
                    end_date = st.date_input(
                        "End Date",
                        min_value=start_date,
                        value=start_date + timedelta(days=1)
                    )
                
                # Purpose of booking
                purpose = st.text_area("Purpose of Booking", height=100)
                
                # Book button
                if st.button("Book Equipment"):
                    if not purpose:
                        st.error("Please provide the purpose of booking.")
                    else:
                        # Check for booking conflicts
                        conflict = False
                        for booking in st.session_state.booking_data:
                            if booking["equipment_id"] == equipment_id:
                                booking_start = datetime.strptime(booking["start_date"], "%Y-%m-%d")
                                booking_end = datetime.strptime(booking["end_date"], "%Y-%m-%d")
                                
                                if (start_date <= booking_end.date() and end_date >= booking_start.date()):
                                    conflict = True
                                    break
                        
                        if conflict:
                            st.error("This equipment is already booked for the selected dates.")
                        else:
                            # Create new booking
                            new_booking = {
                                "id": len(st.session_state.booking_data) + 1,
                                "user_email": st.session_state.user_email,
                                "equipment_id": equipment_id,
                                "start_date": start_date.strftime("%Y-%m-%d"),
                                "end_date": end_date.strftime("%Y-%m-%d"),
                                "purpose": purpose,
                                "status": "Confirmed",
                                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            }
                            
                            # Update equipment status
                            for i, equip in enumerate(st.session_state.equipment_data):
                                if equip["id"] == equipment_id:
                                    st.session_state.equipment_data[i]["status"] = "Booked"
                                    break
                            
                            st.session_state.booking_data.append(new_booking)
                            st.success(f"Successfully booked {equipment['name']} from {start_date} to {end_date}")
                            st.rerun()
    
        # My Bookings Section
        st.markdown("---")
        st.subheader("My Bookings")
        
        user_bookings = [b for b in st.session_state.booking_data if b["user_email"] == st.session_state.user_email]
        
        if not user_bookings:
            st.info("You haven't made any bookings yet.")
        else:
            booking_data = []
            
            for b in user_bookings:
                equipment = next((e for e in st.session_state.equipment_data if e["id"] == b["equipment_id"]), None)
                equipment_name = equipment["name"] if equipment else "Unknown"
                
                booking_data.append({
                    "ID": b["id"],
                    "Equipment": equipment_name,
                    "Start Date": b["start_date"],
                    "End Date": b["end_date"],
                    "Status": b["status"]
                })
            
            df = pd.DataFrame(booking_data)
            st.dataframe(df, use_container_width=True)
            
            # Allow cancelling bookings
            st.subheader("Cancel Booking")
            
            active_bookings = [b for b in user_bookings if b["status"] == "Confirmed"]
            if not active_bookings:
                st.info("You don't have any active bookings to cancel.")
            else:
                booking_options = {f"{b['id']}: {next((e['name'] for e in st.session_state.equipment_data if e['id'] == b['equipment_id']), 'Unknown')} ({b['start_date']} to {b['end_date']})" for b in active_bookings}
                
                selected_booking = st.selectbox(
                    "Select Booking to Cancel",
                    options=sorted(list(booking_options))
                )
                
                # Extract booking ID from selection
                booking_id = int(selected_booking.split(":")[0])
                
                if st.button("Cancel Booking"):
                    # Update booking status
                    for i, booking in enumerate(st.session_state.booking_data):
                        if booking["id"] == booking_id:
                            st.session_state.booking_data[i]["status"] = "Cancelled"
                            
                            # Update equipment status back to Available
                            equipment_id = booking["equipment_id"]
                            for j, equip in enumerate(st.session_state.equipment_data):
                                if equip["id"] == equipment_id:
                                    st.session_state.equipment_data[j]["status"] = "Available"
                                    break
                            
                            st.success("Booking cancelled successfully.")
                            st.rerun()
                            break

def show_profile():
    col1, col2 = st.columns([1, 3])
    with col1:
        st.image("assets/badge.png", width=150)
    with col2:
        st.markdown("<h1 style='margin-bottom:0;'>SOROTI UNIVERSITY</h1>", unsafe_allow_html=True)
        st.markdown("<h2 style='margin-top:0;'>My Profile</h2>", unsafe_allow_html=True)
    
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

def show_settings():
    col1, col2 = st.columns([1, 3])
    with col1:
        st.image("assets/badge.png", width=150)
    with col2:
        st.markdown("<h1 style='margin-bottom:0;'>SOROTI UNIVERSITY</h1>", unsafe_allow_html=True)
        st.markdown("<h2 style='margin-top:0;'>Settings</h2>", unsafe_allow_html=True)
    
    # Theme settings
    st.subheader("Appearance")
    
    # Coffee brown theme colors
    coffee_colors = {
        "light": "#8B5A2B",
        "dark": "#3E2723"
    }
    
    col1, col2 = st.columns(2)
    
    with col1:
        theme = st.radio(
            "Theme Mode",
            options=["Light", "Dark"],
            index=0 if st.session_state.theme == "light" else 1,
            horizontal=True
        )
    
    with col2:
        st.markdown(
            f"""
            <div style="background-color: {coffee_colors['light']}; padding: 10px; border-radius: 5px; margin-bottom: 5px;">
                <p style="color: white; margin: 0;">Light Theme</p>
            </div>
            <div style="background-color: {coffee_colors['dark']}; padding: 10px; border-radius: 5px;">
                <p style="color: white; margin: 0;">Dark Theme</p>
            </div>
            """,
            unsafe_allow_html=True
        )
    
    if theme == "Light" and st.session_state.theme != "light":
        st.session_state.theme = "light"
        st.success("Theme changed to Light mode!")
        st.rerun()
    elif theme == "Dark" and st.session_state.theme != "dark":
        st.session_state.theme = "dark"
        st.success("Theme changed to Dark mode!")
        st.rerun()
    
    # Notification settings
    st.subheader("Notifications")
    
    email_notifications = st.toggle(
        "Email notifications",
        value=st.session_state.get("email_notifications", True),
        help="Receive email notifications for booking confirmations, reminders, etc."
    )
    
    reminder_days = st.slider(
        "Booking reminders (days before)",
        min_value=0,
        max_value=7,
        value=st.session_state.get("reminder_days", 1),
        help="Number of days before a booking to receive a reminder"
    )
    
    # Account settings
    st.subheader("Account")
    
    # Change email
    st.write("**Change Email Address**")
    current_email = st.session_state.user_email
    st.write(f"Current email: {current_email}")
    
    new_email = st.text_input("New Email Address")
    
    if st.button("Update Email") and new_email:
        try:
            validate_email(new_email)
            st.session_state.user_email = new_email
            st.success("Email updated successfully!")
            st.rerun()
        except EmailNotValidError:
            st.error("Please enter a valid email address")
    
    # Change password
    st.write("**Change Password**")
    
    current_password = st.text_input("Current Password", type="password")
    new_password = st.text_input("New Password", type="password")
    confirm_password = st.text_input("Confirm New Password", type="password")
    
    if st.button("Update Password"):
        if not current_password or not new_password or not confirm_password:
            st.error("Please fill in all password fields")
        elif current_password != st.session_state.user_data.get("password", ""):
            st.error("Current password is incorrect")
        elif new_password != confirm_password:
            st.error("New passwords do not match")
        elif len(new_password) < 6:
            st.error("Password must be at least 6 characters long")
        else:
            # Update password in user data
            st.session_state.user_data["password"] = new_password
            st.success("Password updated successfully!")
    
    # Save all settings
    if st.button("Save All Settings"):
        # Save notification settings
        st.session_state["email_notifications"] = email_notifications
        st.session_state["reminder_days"] = reminder_days
        
        st.success("All settings saved successfully!")

def show_equipment_management():
    col1, col2 = st.columns([1, 3])
    with col1:
        st.image("assets/badge.png", width=150)
    with col2:
        st.markdown("<h1 style='margin-bottom:0;'>SOROTI UNIVERSITY</h1>", unsafe_allow_html=True)
        st.markdown("<h2 style='margin-top:0;'>Equipment Management</h2>", unsafe_allow_html=True)
    
    # Check if user is authorized to access this page (lab technician)
    if not st.session_state.user_data.get("is_admin", False):
        st.error("You do not have permission to access this page.")
        st.stop()
    
    tab1, tab2, tab3, tab4 = st.tabs(["Equipment List", "Add Equipment", "Edit Equipment", "Reports"])
    
    with tab1:
        st.subheader("Equipment Inventory")
        
        # Filters
        st.sidebar.header("Filters")
        categories = set(e["category"] for e in st.session_state.equipment_data)
        category_filter = st.sidebar.selectbox(
            "Category",
            ["All"] + sorted(list(categories))
        )
        
        status_filter = st.sidebar.selectbox(
            "Status",
            ["All", "Available", "Booked", "Maintenance"]
        )
        
        search_term = st.sidebar.text_input("Search Equipment")
        
        # Filter equipment
        filtered_equipment = st.session_state.equipment_data
        
        if category_filter != "All":
            filtered_equipment = [e for e in filtered_equipment if e["category"] == category_filter]
            
        if status_filter != "All":
            filtered_equipment = [e for e in filtered_equipment if e["status"] == status_filter]
            
        if search_term:
            filtered_equipment = [e for e in filtered_equipment if search_term.lower() in e["name"].lower() or search_term.lower() in e["description"].lower()]
        
        # Display equipment
        if not filtered_equipment:
            st.info("No equipment found matching your criteria.")
        else:
            st.write(f"Showing {len(filtered_equipment)} equipment items")
            
            # Convert to DataFrame for better display
            equipment_data = []
            for e in filtered_equipment:
                equipment_data.append({
                    "ID": e["id"],
                    "Name": e["name"],
                    "Category": e["category"],
                    "Location": e["location"],
                    "Status": e["status"]
                })
            
            df = pd.DataFrame(equipment_data)
            st.dataframe(df, use_container_width=True)
            
            # Equipment details and actions
            st.subheader("Equipment Details")
            
            selected_equipment_id = st.selectbox(
                "Select Equipment",
                options=[f"{e['id']}: {e['name']}" for e in filtered_equipment]
            )
            
            # Extract equipment ID from selection
            equipment_id = int(selected_equipment_id.split(":")[0])
            
            # Display detailed information
            equipment = get_equipment(equipment_id)
            if equipment:
                st.write(f"**Name:** {equipment['name']}")
                st.write(f"**Description:** {equipment['description']}")
                st.write(f"**Category:** {equipment['category']}")
                st.write(f"**Location:** {equipment['location']}")
                st.write(f"**Status:** {equipment['status']}")
                
                # Status change options
                new_status = st.selectbox(
                    "Change Status",
                    options=["Available", "Booked", "Maintenance"],
                    index=["Available", "Booked", "Maintenance"].index(equipment["status"])
                )
                
                if st.button("Update Status"):
                    if new_status != equipment["status"]:
                        # Check if equipment can be made available if it's booked
                        if equipment["status"] == "Booked" and new_status == "Available":
                            # Check if any active bookings exist
                            active_bookings = False
                            for booking in st.session_state.booking_data:
                                if booking["equipment_id"] == equipment_id and booking["status"] == "Confirmed":
                                    active_bookings = True
                                    break
                            
                            if active_bookings:
                                st.error("Cannot change status to Available as this equipment has active bookings.")
                            else:
                                update_equipment_status(equipment_id, new_status)
                                st.success(f"Status updated to {new_status}")
                                st.rerun()
                        else:
                            update_equipment_status(equipment_id, new_status)
                            st.success(f"Status updated to {new_status}")
                            st.rerun()
                
                # Delete equipment button
                if st.button("Delete Equipment", type="primary", help="This will permanently remove the equipment"):
                    success, message = delete_equipment(equipment_id)
                    if success:
                        st.success(message)
                        st.rerun()
                    else:
                        st.error(message)
    
    with tab2:
        st.subheader("Add New Equipment")
        
        # Form for adding new equipment
        with st.form("add_equipment_form"):
            name = st.text_input("Equipment Name")
            description = st.text_area("Description")
            
            # Get existing categories for dropdown
            existing_categories = sorted(set(e["category"] for e in st.session_state.equipment_data))
            category_option = st.selectbox(
                "Category",
                options=["Select Category"] + existing_categories + ["Add New Category"]
            )
            
            # Allow adding new category
            if category_option == "Add New Category":
                new_category = st.text_input("New Category Name")
                category = new_category
            else:
                category = None if category_option == "Select Category" else category_option
            
            location = st.text_input("Location")
            
            status = st.selectbox(
                "Status",
                options=["Available", "Maintenance"]
            )
            
            submit_button = st.form_submit_button("Add Equipment")
            
            if submit_button:
                if not name:
                    st.error("Equipment name is required")
                elif not description:
                    st.error("Description is required")
                elif not category:
                    st.error("Please select or add a category")
                elif not location:
                    st.error("Location is required")
                else:
                    new_equipment = add_equipment(
                        name=name,
                        description=description,
                        category=category,
                        location=location,
                        status=status
                    )
                    
                    st.success(f"Added new equipment: {name}")
                    st.rerun()
    
    with tab3:
        st.subheader("Edit Equipment")
        
        # Select equipment to edit
        edit_equipment_options = [f"{e['id']}: {e['name']}" for e in st.session_state.equipment_data]
        if not edit_equipment_options:
            st.info("No equipment available to edit.")
        else:
            selected_edit = st.selectbox(
                "Select Equipment to Edit",
                options=edit_equipment_options,
                key="edit_equipment_select"
            )
            
            # Extract equipment ID
            edit_id = int(selected_edit.split(":")[0])
            equipment = get_equipment(edit_id)
            
            if equipment:
                with st.form("edit_equipment_form"):
                    edit_name = st.text_input("Equipment Name", value=equipment["name"])
                    edit_description = st.text_area("Description", value=equipment["description"])
                    
                    # Get existing categories for dropdown
                    existing_categories = sorted(set(e["category"] for e in st.session_state.equipment_data))
                    
                    # Pre-select current category
                    current_category_index = 0
                    try:
                        current_category_index = existing_categories.index(equipment["category"])
                    except ValueError:
                        pass
                    
                    edit_category_option = st.selectbox(
                        "Category",
                        options=existing_categories + ["Add New Category"],
                        index=current_category_index
                    )
                    
                    # Allow adding new category
                    if edit_category_option == "Add New Category":
                        new_category = st.text_input("New Category Name")
                        edit_category = new_category
                    else:
                        edit_category = edit_category_option
                    
                    edit_location = st.text_input("Location", value=equipment["location"])
                    
                    edit_status = st.selectbox(
                        "Status",
                        options=["Available", "Booked", "Maintenance"],
                        index=["Available", "Booked", "Maintenance"].index(equipment["status"])
                    )
                    
                    update_button = st.form_submit_button("Update Equipment")
                    
                    if update_button:
                        if not edit_name:
                            st.error("Equipment name is required")
                        elif not edit_description:
                            st.error("Description is required")
                        elif not edit_category:
                            st.error("Please select or add a category")
                        elif not edit_location:
                            st.error("Location is required")
                        else:
                            # Check if status change is allowed
                            if equipment["status"] == "Booked" and edit_status == "Available":
                                # Check if any active bookings exist
                                active_bookings = False
                                for booking in st.session_state.booking_data:
                                    if booking["equipment_id"] == edit_id and booking["status"] == "Confirmed":
                                        active_bookings = True
                                        break
                                
                                if active_bookings:
                                    st.error("Cannot change status to Available as this equipment has active bookings.")
                                    st.stop()
                            
                            # Update equipment
                            updated_data = {
                                "name": edit_name,
                                "description": edit_description,
                                "category": edit_category,
                                "location": edit_location,
                                "status": edit_status
                            }
                            
                            update_equipment(edit_id, updated_data)
                            st.success(f"Updated equipment: {edit_name}")
                            st.rerun()
    
    with tab4:
        st.subheader("Equipment Reports")
        
        report_type = st.radio(
            "Report Type",
            options=["Equipment Status", "Equipment Usage", "Availability Summary"],
            horizontal=True
        )
        
        if report_type == "Equipment Status":
            # Count equipment by status
            statuses = ["Available", "Booked", "Maintenance"]
            status_counts = {}
            
            for status in statuses:
                status_counts[status] = len([e for e in st.session_state.equipment_data if e["status"] == status])
            
            # Display status chart
            st.bar_chart(status_counts)
            
            # Display status table
            status_data = []
            for status, count in status_counts.items():
                status_data.append({
                    "Status": status,
                    "Count": count,
                    "Percentage": f"{count / len(st.session_state.equipment_data) * 100:.1f}%"
                })
            
            st.table(pd.DataFrame(status_data))
            
        elif report_type == "Equipment Usage":
            # Equipment most frequently booked
            booking_counts = {}
            
            for equipment in st.session_state.equipment_data:
                equipment_id = equipment["id"]
                booking_counts[equipment["name"]] = 0
                
                for booking in st.session_state.booking_data:
                    if booking["equipment_id"] == equipment_id:
                        booking_counts[equipment["name"]] += 1
            
            # Sort by number of bookings
            booking_counts = dict(sorted(booking_counts.items(), key=lambda x: x[1], reverse=True))
            
            if booking_counts:
                st.bar_chart(booking_counts)
                
                # Display as table
                usage_data = []
                for equip_name, count in booking_counts.items():
                    usage_data.append({
                        "Equipment": equip_name,
                        "Total Bookings": count
                    })
                
                st.table(pd.DataFrame(usage_data))
            else:
                st.info("No booking data available yet.")
                
        elif report_type == "Availability Summary":
            # Group equipment by category
            categories = {}
            
            for equipment in st.session_state.equipment_data:
                category = equipment["category"]
                if category not in categories:
                    categories[category] = {
                        "total": 0,
                        "available": 0
                    }
                
                categories[category]["total"] += 1
                if equipment["status"] == "Available":
                    categories[category]["available"] += 1
            
            # Display as table
            availability_data = []
            for category, counts in categories.items():
                availability_data.append({
                    "Category": category,
                    "Total Equipment": counts["total"],
                    "Available": counts["available"],
                    "Availability %": f"{counts['available'] / counts['total'] * 100:.1f}%"
                })
            
            st.table(pd.DataFrame(availability_data))

# ====================================================
# Main Application
# ====================================================

# Initialize session state variables if they don't exist
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
if 'user_email' not in st.session_state:
    st.session_state.user_email = ""
if 'theme' not in st.session_state:
    st.session_state.theme = "dark"  # Set default theme to dark for coffee brown theme
if 'user_data' not in st.session_state:
    st.session_state.user_data = {}
if 'equipment_data' not in st.session_state:
    # Initialize with sample equipment
    st.session_state.equipment_data = initialize_equipment()
if 'booking_data' not in st.session_state:
    st.session_state.booking_data = []
if 'current_page' not in st.session_state:
    st.session_state.current_page = "dashboard"

# Main application structure
def main():
    # Apply theme from session state
    if st.session_state.theme == "dark":
        st.markdown("""
        <style>
        :root {
            --background-color: #0e1117;
            --text-color: #fafafa;
        }
        </style>
        """, unsafe_allow_html=True)
    
    # Handle navigation and page display
    if st.session_state.logged_in:
        with st.sidebar:
            st.image("assets/badge.png", width=150)
            
            # Check if user is a Lab Technician (admin)
            is_admin = st.session_state.user_data.get("is_admin", False)
            user_category = st.session_state.user_data.get("user_category", "")
            
            # Display user category and admin status if applicable
            if user_category:
                if is_admin:
                    st.markdown(f"**{user_category} (Admin)**")
                else:
                    st.markdown(f"**{user_category}**")
            
            # Different menu options depending on user type
            if is_admin:
                selected = option_menu(
                    menu_title="Navigation",
                    options=["Dashboard", "Manage Equipment", "Book Equipment", "My Profile", "Settings", "Logout"],
                    icons=["house", "tools", "calendar", "person", "gear", "box-arrow-right"],
                    menu_icon="cast",
                    default_index=0,
                )
            else:
                selected = option_menu(
                    menu_title="Navigation",
                    options=["Dashboard", "Book Equipment", "My Profile", "Settings", "Logout"],
                    icons=["house", "calendar", "person", "gear", "box-arrow-right"],
                    menu_icon="cast",
                    default_index=0,
                )
            
            st.markdown("---")
            st.markdown(f"Logged in as: **{st.session_state.user_email}**")
            
            # Store selected page in session state
            if selected == "Dashboard":
                st.session_state.current_page = "dashboard"
            elif selected == "Book Equipment":
                st.session_state.current_page = "booking"
            elif selected == "Manage Equipment":
                st.session_state.current_page = "manage"
            elif selected == "My Profile":
                st.session_state.current_page = "profile"
            elif selected == "Settings":
                st.session_state.current_page = "settings"
            elif selected == "Logout":
                logout()
                st.rerun()
        
        # Display appropriate page based on current_page
        if st.session_state.current_page == "dashboard":
            show_dashboard()
        elif st.session_state.current_page == "booking":
            show_booking_page()
        elif st.session_state.current_page == "manage" and is_admin:
            show_equipment_management()
        elif st.session_state.current_page == "profile":
            show_profile()
        elif st.session_state.current_page == "settings":
            show_settings()
    else:
        display_badge()
        show_auth_page()

if __name__ == "__main__":
    main()
