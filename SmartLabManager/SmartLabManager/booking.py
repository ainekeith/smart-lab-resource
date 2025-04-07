import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import time
import random
from java_bridge import get_java_bridge

# Import styles if available
try:
    from styles import (
        set_background_image, 
        apply_custom_styles, 
        centered_title, 
        info_card,
        create_footer
    )
except ImportError:
    # Fallback styling functions
    def set_background_image(image_file, opacity=0.3):
        pass
    def apply_custom_styles():
        pass
    def centered_title(title, subtitle=None):
        st.title(title)
        if subtitle:
            st.subheader(subtitle)
    def info_card(title, content, icon="ℹ️"):
        st.info(f"{icon} **{title}**: {content}")
    def create_footer():
        st.markdown("---\n© 2025 S-Lab - Soroti University")

def filter_equipment(equipment_list, category=None, status=None, search_term=None):
    """
    Filter equipment based on multiple criteria
    
    Args:
        equipment_list (list): List of equipment dictionaries
        category (str): Category to filter by
        status (str): Status to filter by
        search_term (str): Search term to filter by
        
    Returns:
        list: Filtered equipment list
    """
    filtered = equipment_list
    
    if category and category != "All":
        filtered = [e for e in filtered if e["category"] == category]
    
    if status and status != "All":
        filtered = [e for e in filtered if e["status"] == status]
    
    if search_term:
        search_term = search_term.lower()
        filtered = [e for e in filtered if search_term in e["name"].lower() or 
                   search_term in e["description"].lower()]
    
    return filtered

def display_equipment_card(equipment):
    """
    Display equipment details in a styled card
    
    Args:
        equipment (dict): Equipment data dictionary
    """
    # Create a styled card for the equipment
    status_color = {
        "Available": "#5cb85c",  # Green
        "Booked": "#f0ad4e",     # Orange
        "Maintenance": "#d9534f"  # Red
    }.get(equipment["status"], "#6c757d")  # Default gray
    
    card_html = f"""
    <div style="background-color: rgba(255, 255, 255, 0.8); 
                border-radius: 15px; 
                padding: 1.5rem; 
                margin: 1rem 0; 
                box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                border-left: 5px solid {status_color};
                transition: transform 0.3s ease, box-shadow 0.3s ease;"
         onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 15px 30px rgba(0,0,0,0.1)';"
         onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 10px 20px rgba(0,0,0,0.05)';">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h3 style="color: #3d2314; margin: 0; font-weight: bold;">{equipment["name"]}</h3>
                <p style="margin: 0.5rem 0; color: #666;">{equipment["description"]}</p>
            </div>
            <div>
                <span style="display: inline-block; 
                            background-color: {status_color}; 
                            color: white; 
                            padding: 0.3rem 0.8rem; 
                            border-radius: 30px; 
                            font-size: 0.8rem;
                            font-weight: bold;">
                    {equipment["status"]}
                </span>
            </div>
        </div>
        <div style="margin-top: 1rem;">
            <p><strong>Category:</strong> {equipment["category"]}</p>
            <p><strong>Location:</strong> {equipment["location"]}</p>
        </div>
    </div>
    """
    st.markdown(card_html, unsafe_allow_html=True)

def generate_calendar_view(bookings, equipment_id=None, days=14):
    """
    Generate a calendar view of bookings
    
    Args:
        bookings (list): List of booking dictionaries
        equipment_id (int): Equipment ID to filter bookings for, or None for all equipment
        days (int): Number of days to show
        
    Returns:
        str: HTML for calendar view
    """
    # Filter bookings for the specified equipment if provided
    if equipment_id is not None:
        filtered_bookings = [b for b in bookings if b["equipment_id"] == equipment_id]
    else:
        filtered_bookings = bookings
    
    # Get date range
    start_date = datetime.today().date()
    date_range = [start_date + timedelta(days=i) for i in range(days)]
    
    # Generate calendar HTML
    calendar_html = """
    <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
            <thead>
                <tr style="background-color: #6f4e37; color: white;">
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd; position: sticky; left: 0; background-color: #6f4e37;">Date</th>
    """
    
    # Add time slots as columns
    time_slots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
    for slot in time_slots:
        calendar_html += f'<th style="padding: 10px; text-align: center; border: 1px solid #ddd;">{slot}</th>'
    
    calendar_html += """
                </tr>
            </thead>
            <tbody>
    """
    
    # Add a row for each date
    for date in date_range:
        date_str = date.strftime("%Y-%m-%d")
        day_name = date.strftime("%a")
        date_display = date.strftime("%b %d")
        
        # Determine row background color (weekends different)
        bg_color = "#f8f4f0" if date.weekday() >= 5 else "white"
        
        calendar_html += f"""
            <tr>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; background-color: {bg_color}; position: sticky; left: 0; font-weight: bold;">
                    {day_name}<br>{date_display}
                </td>
        """
        
        # Check each time slot for bookings
        for i, slot in enumerate(time_slots):
            # Find bookings that overlap with this time slot
            slot_bookings = []
            for booking in filtered_bookings:
                if booking["start_date"] == date_str and "start_time" in booking and "end_time" in booking:
                    # Convert time to comparable format
                    booking_start = datetime.strptime(booking["start_time"], "%H:%M").time()
                    booking_end = datetime.strptime(booking["end_time"], "%H:%M").time()
                    slot_time = datetime.strptime(slot, "%H:%M").time()
                    next_slot_time = datetime.strptime(time_slots[i+1], "%H:%M").time() if i < len(time_slots)-1 else None
                    
                    # Check if booking overlaps with this slot
                    if booking_start <= slot_time and (next_slot_time is None or booking_end > slot_time):
                        slot_bookings.append(booking)
            
            # Determine cell color based on bookings
            if slot_bookings:
                equipment_names = []
                for booking in slot_bookings:
                    equipment = next((e for e in st.session_state.equipment_data if e["id"] == booking["equipment_id"]), None)
                    equipment_names.append(equipment["name"] if equipment else "Unknown")
                
                # Create tooltip with booking info
                tooltip = ", ".join(equipment_names)
                cell_html = f"""
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd; background-color: rgba(111, 78, 55, 0.3);" title="{tooltip}">
                        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #d9534f;"></span>
                    </td>
                """
            else:
                cell_html = f"""
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd; background-color: {bg_color};">
                        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #5cb85c;"></span>
                    </td>
                """
            
            calendar_html += cell_html
        
        calendar_html += "</tr>"
    
    calendar_html += """
            </tbody>
        </table>
    </div>
    <div style="margin-top: 10px; font-size: 0.9rem;">
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #5cb85c; margin-right: 5px;"></span> Available
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #d9534f; margin-right: 5px; margin-left: 15px;"></span> Booked
    </div>
    """
    
    return calendar_html

def display_session_options():
    """Display lab session booking and management options"""
    # Add tab styling
    tab_css = """
    <style>
    button[data-baseweb="tab"] {
        font-size: 1.1rem;
        font-weight: bold;
        padding: 0.6rem 1.5rem;
        border-radius: 10px 10px 0 0;
        background-color: rgba(224, 210, 195, 0.5);
        color: #6f4e37;
        margin-right: 0.5rem;
    }
    
    button[data-baseweb="tab"][aria-selected="true"] {
        background-color: #6f4e37;
        color: white;
    }
    
    div.stExpander {
        border: 1px solid #e0d2c3;
        border-radius: 10px;
        box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
        overflow: hidden;
    }
    </style>
    """
    st.markdown(tab_css, unsafe_allow_html=True)
    
    st.subheader("Lab Session Management")
    
    # Check if user is a lab assistant or professor
    user_category = st.session_state.user_data.get("user_category", "")
    is_lab_staff = user_category in ["Lab Technician", "Lecturer"]
    
    # Initialize lab sessions if not exists
    if "lab_sessions" not in st.session_state:
        st.session_state.lab_sessions = []
    
    # Tabs for session management
    tab1, tab2 = st.tabs(["Available Sessions", "Create Session" if is_lab_staff else "My Registrations"])
    
    with tab1:
        # Display available lab sessions
        if not st.session_state.lab_sessions:
            no_sessions_html = """
            <div style="background-color: rgba(255, 255, 255, 0.8); 
                        border-radius: 15px; 
                        padding: 2rem; 
                        text-align: center;
                        margin: 2rem 0;">
                <img src="https://cdn-icons-png.flaticon.com/512/6565/6565544.png" style="width: 80px; opacity: 0.5;">
                <h3 style="color: #6f4e37; margin-top: 1rem;">No Lab Sessions Available</h3>
                <p style="color: #666;">There are currently no lab sessions scheduled. Please check back later or contact your lab instructor.</p>
            </div>
            """
            st.markdown(no_sessions_html, unsafe_allow_html=True)
        else:
            # Filter to show only future sessions with Open status
            today = datetime.today().date()
            open_sessions = []
            
            for session in st.session_state.lab_sessions:
                try:
                    session_date = datetime.strptime(session["date"], "%Y-%m-%d").date()
                    if session_date >= today and session["status"] == "Open":
                        open_sessions.append(session)
                except:
                    continue
            
            if not open_sessions:
                st.info("No upcoming lab sessions available.")
            else:
                # Display as styled cards
                st.markdown("<h3 style='color: #3d2314;'>Upcoming Lab Sessions</h3>", unsafe_allow_html=True)
                
                for session in open_sessions:
                    # Create a styled card for each lab session
                    user_registered = st.session_state.user_email in session.get("participants", [])
                    is_full = len(session.get("participants", [])) >= session.get("capacity", 0)
                    border_color = "#5cb85c" if user_registered else ("#f0ad4e" if is_full else "#6f4e37")
                    
                    session_html = f"""
                    <div style="background-color: rgba(255, 255, 255, 0.8); 
                                border-radius: 15px; 
                                padding: 1.5rem; 
                                margin: 1rem 0; 
                                box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                                border-left: 5px solid {border_color};
                                transition: transform 0.3s ease, box-shadow 0.3s ease;"
                         onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 15px 30px rgba(0,0,0,0.1)';"
                         onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 10px 20px rgba(0,0,0,0.05)';">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h3 style="color: #3d2314; margin: 0; font-weight: bold;">{session["name"]}</h3>
                                <p style="margin: 0.2rem 0 0.5rem 0; color: #6f4e37;">
                                    <span style="font-weight: bold;">{session["date"]}</span> • 
                                    <span>{session["start_time"]} - {session["end_time"]}</span>
                                </p>
                            </div>
                            <div>
                                <span style="display: inline-block; 
                                            background-color: {border_color}; 
                                            color: white; 
                                            padding: 0.3rem 0.8rem; 
                                            border-radius: 30px; 
                                            font-size: 0.8rem;
                                            font-weight: bold;">
                                    {len(session.get("participants", []))}/{session["capacity"]} Slots
                                </span>
                            </div>
                        </div>
                        <div style="margin-top: 1rem;">
                            <p><strong>Room:</strong> {session["lab_room"]}</p>
                            <p><strong>Description:</strong> {session["description"]}</p>
                            <p><strong>Created by:</strong> {session["created_by"]}</p>
                        </div>
                    """
                    
                    st.markdown(session_html, unsafe_allow_html=True)
                    
                    # Button for registration/cancellation
                    col1, col2, col3 = st.columns([2, 2, 1])
                    
                    with col1:
                        if user_registered:
                            if st.button(f"⛔ Cancel Registration #{session['id']}", key=f"cancel_{session['id']}"):
                                # Remove user from participants
                                session["participants"].remove(st.session_state.user_email)
                                st.success("Registration cancelled successfully")
                                st.rerun()
                        elif not is_full:
                            if st.button(f"✅ Register #{session['id']}", key=f"register_{session['id']}"):
                                # Add user to participants
                                if "participants" not in session:
                                    session["participants"] = []
                                session["participants"].append(st.session_state.user_email)
                                st.success("Registered successfully")
                                st.rerun()
                        else:
                            st.error("This session is at full capacity")
                    
                    st.markdown("</div>", unsafe_allow_html=True)
    
    # Check if user is lab technician or professor to allow creating sessions
    if is_lab_staff:
        with tab2:
            st.markdown("<h3 style='color: #3d2314;'>Create a New Lab Session</h3>", unsafe_allow_html=True)
            
            # Create a styled card for session creation
            session_form_html = """
            <div style="background-color: rgba(255, 255, 255, 0.8); 
                        border-radius: 15px; 
                        padding: 1.5rem 1.5rem 0 1.5rem; 
                        margin: 1rem 0; 
                        box-shadow: 0 10px 20px rgba(0,0,0,0.05);">
            """
            st.markdown(session_form_html, unsafe_allow_html=True)
            
            with st.form("create_lab_session"):
                col1, col2 = st.columns(2)
                
                with col1:
                    session_name = st.text_input("Session Name", placeholder="e.g. Physics Lab Experiment 3")
                    
                with col2:
                    lab_room = st.selectbox(
                        "Lab Room",
                        options=["Computer Lab", "Physics Lab", "Chemistry Lab", "Biology Lab", "Engineering Lab", "General Lab"]
                    )
                
                # Date and time selection
                col1, col2 = st.columns(2)
                with col1:
                    date = st.date_input("Session Date", min_value=datetime.today())
                
                # Time selection with Java bridge or fallback
                java_bridge = get_java_bridge()
                
                with col1:
                    # Get Java-powered time slots or use Python fallback
                    try:
                        start_slots = java_bridge.generate_time_slots(8, 17, 30)
                        start_time = st.selectbox("Start Time", options=start_slots)
                    except:
                        # Use Python fallback
                        start_time = st.time_input("Start Time", value=datetime.strptime("08:00", "%H:%M").time())
                
                with col2:
                    try:
                        if isinstance(start_time, str):
                            start_idx = start_slots.index(start_time)
                            end_slots = start_slots[start_idx+1:]
                        else:
                            # If using the Python time_input fallback
                            end_slots = java_bridge.generate_time_slots(9, 18, 30)
                        end_time = st.selectbox("End Time", options=end_slots)
                    except:
                        # Use Python fallback
                        end_time = st.time_input("End Time", value=datetime.strptime("10:00", "%H:%M").time())
                
                # Additional details
                col1, col2 = st.columns(2)
                with col1:
                    capacity = st.number_input("Maximum Capacity", min_value=1, max_value=100, value=30)
                
                with col2:
                    topics = st.text_input("Main Topics", placeholder="e.g. Circuit Analysis, Resistance")
                
                description = st.text_area("Session Description", height=100, 
                                         placeholder="Provide details about this lab session, including required preparation and materials.")
                
                # Submit button with animation
                col1, col2 = st.columns([3, 1])
                with col1:
                    submit = st.form_submit_button("Create Lab Session", use_container_width=True)
                
                if submit:
                    # Form validation
                    with st.spinner("Creating lab session..."):
                        time.sleep(0.5)  # Add a small delay for UX
                        
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
                                    "topics": topics,
                                    "created_by": st.session_state.user_email,
                                    "participants": [],
                                    "status": "Open"
                                }
                                
                                st.session_state.lab_sessions.append(new_session)
                                st.success(f"Created lab session: {session_name}")
                                st.rerun()
            
            st.markdown("</div>", unsafe_allow_html=True)
            
            # Show sessions created by this staff member
            st.markdown("<h3 style='color: #3d2314; margin-top: 2rem;'>Manage Your Lab Sessions</h3>", unsafe_allow_html=True)
            
            if "lab_sessions" not in st.session_state or not st.session_state.lab_sessions:
                st.info("You haven't created any lab sessions yet.")
            else:
                # Filter to show only sessions created by this staff member
                my_sessions = [s for s in st.session_state.lab_sessions if s["created_by"] == st.session_state.user_email]
                
                if not my_sessions:
                    st.info("You haven't created any lab sessions yet.")
                else:
                    for session in my_sessions:
                        # Create a styled card for each session
                        border_color = "#5cb85c" if session["status"] == "Open" else "#f0ad4e"
                        
                        session_html = f"""
                        <div style="background-color: rgba(255, 255, 255, 0.8); 
                                    border-radius: 15px; 
                                    padding: 1.5rem; 
                                    margin: 1rem 0; 
                                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                                    border-left: 5px solid {border_color};">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <h3 style="color: #3d2314; margin: 0; font-weight: bold;">{session["name"]}</h3>
                                    <p style="margin: 0.2rem 0 0.5rem 0; color: #6f4e37;">
                                        <span style="font-weight: bold;">{session["date"]}</span> • 
                                        <span>{session["start_time"]} - {session["end_time"]}</span>
                                    </p>
                                </div>
                                <div>
                                    <span style="display: inline-block; 
                                                background-color: {border_color}; 
                                                color: white; 
                                                padding: 0.3rem 0.8rem; 
                                                border-radius: 30px; 
                                                font-size: 0.8rem;
                                                font-weight: bold;">
                                        {session["status"]}
                                    </span>
                                </div>
                            </div>
                            <div style="margin-top: 1rem;">
                                <p><strong>Room:</strong> {session["lab_room"]}</p>
                                <p><strong>Description:</strong> {session["description"]}</p>
                                <p><strong>Participants:</strong> {len(session.get("participants", []))}/{session["capacity"]}</p>
                            </div>
                        """
                        
                        st.markdown(session_html, unsafe_allow_html=True)
                        
                        # Participants section
                        if session.get("participants", []):
                            st.write("**Participants:**")
                            participants_list = "<ol>"
                            for participant in session["participants"]:
                                participants_list += f"<li>{participant}</li>"
                            participants_list += "</ol>"
                            st.markdown(participants_list, unsafe_allow_html=True)
                        
                        # Action buttons
                        col1, col2 = st.columns(2)
                        with col1:
                            if session["status"] == "Open":
                                if st.button(f"🔒 Close Registration #{session['id']}", key=f"close_{session['id']}"):
                                    session["status"] = "Closed"
                                    st.success("Session registration closed")
                                    st.rerun()
                            else:
                                if st.button(f"🔓 Reopen Registration #{session['id']}", key=f"reopen_{session['id']}"):
                                    session["status"] = "Open"
                                    st.success("Session registration reopened")
                                    st.rerun()
                        
                        with col2:
                            if st.button(f"❌ Cancel Session #{session['id']}", key=f"delete_{session['id']}"):
                                # Remove session from list
                                st.session_state.lab_sessions.remove(session)
                                st.success("Session cancelled")
                                st.rerun()
                        
                        st.markdown("</div>", unsafe_allow_html=True)
    else:
        # For regular users, show their session registrations
        with tab2:
            st.markdown("<h3 style='color: #3d2314;'>My Session Registrations</h3>", unsafe_allow_html=True)
            
            if "lab_sessions" not in st.session_state or not st.session_state.lab_sessions:
                st.info("No lab sessions available.")
            else:
                # Filter to show only sessions that the user is registered for
                my_registrations = [
                    s for s in st.session_state.lab_sessions 
                    if st.session_state.user_email in s.get("participants", [])
                ]
                
                if not my_registrations:
                    no_reg_html = """
                    <div style="background-color: rgba(255, 255, 255, 0.8); 
                                border-radius: 15px; 
                                padding: 2rem; 
                                text-align: center;
                                margin: 2rem 0;">
                        <img src="https://cdn-icons-png.flaticon.com/512/6565/6565544.png" style="width: 80px; opacity: 0.5;">
                        <h3 style="color: #6f4e37; margin-top: 1rem;">No Registrations Found</h3>
                        <p style="color: #666;">You haven't registered for any lab sessions yet. Browse available sessions and register to see them here.</p>
                    </div>
                    """
                    st.markdown(no_reg_html, unsafe_allow_html=True)
                else:
                    # Sort by date
                    my_registrations.sort(key=lambda x: x["date"])
                    
                    for session in my_registrations:
                        # Create a styled card for each registration
                        session_date = datetime.strptime(session["date"], "%Y-%m-%d").date()
                        is_past = session_date < datetime.today().date()
                        border_color = "#6c757d" if is_past else "#5cb85c"
                        
                        session_html = f"""
                        <div style="background-color: rgba(255, 255, 255, 0.8); 
                                    border-radius: 15px; 
                                    padding: 1.5rem; 
                                    margin: 1rem 0; 
                                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                                    border-left: 5px solid {border_color};">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <h3 style="color: #3d2314; margin: 0; font-weight: bold;">{session["name"]}</h3>
                                    <p style="margin: 0.2rem 0 0.5rem 0; color: #6f4e37;">
                                        <span style="font-weight: bold;">{session["date"]}</span> • 
                                        <span>{session["start_time"]} - {session["end_time"]}</span>
                                    </p>
                                </div>
                                <div>
                                    <span style="display: inline-block; 
                                                background-color: {border_color}; 
                                                color: white; 
                                                padding: 0.3rem 0.8rem; 
                                                border-radius: 30px; 
                                                font-size: 0.8rem;
                                                font-weight: bold;">
                                        {"Past" if is_past else "Upcoming"}
                                    </span>
                                </div>
                            </div>
                            <div style="margin-top: 1rem;">
                                <p><strong>Room:</strong> {session["lab_room"]}</p>
                                <p><strong>Description:</strong> {session["description"]}</p>
                            </div>
                        """
                        
                        st.markdown(session_html, unsafe_allow_html=True)
                        
                        # Cancel registration button (if not past)
                        if not is_past:
                            if st.button(f"⛔ Cancel Registration #{session['id']}", key=f"my_cancel_{session['id']}"):
                                # Remove user from participants
                                session["participants"].remove(st.session_state.user_email)
                                st.success("Registration cancelled successfully")
                                st.rerun()
                        
                        st.markdown("</div>", unsafe_allow_html=True)

def show_booking_page():
    """Enhanced booking page with fancy styling"""
    # Apply background image and styling
    try:
        set_background_image("assets/backgrounds/lab_pattern.svg", opacity=0.15)
    except:
        try:
            set_background_image("assets/badge.png", opacity=0.08)
        except:
            pass
    
    # Apply custom styles
    apply_custom_styles()
    
    # Display university header with logo
    col1, col2 = st.columns([1, 3])
    with col1:
        st.image("assets/badge.png", width=150)
    with col2:
        st.markdown("<h1 style='margin-bottom:0; color: #3d2314; font-size: 2.5rem; font-weight: bold;'>SOROTI UNIVERSITY</h1>", unsafe_allow_html=True)
        st.markdown("<h2 style='margin-top:0; color: #6f4e37; font-style: italic;'>Resource Booking System</h2>", unsafe_allow_html=True)
    
    # Add tabs for booking types
    booking_type = st.radio(
        "What would you like to book?",
        options=["Equipment Booking", "Lab Session Booking"],
        horizontal=True
    )
    
    if booking_type == "Lab Session Booking":
        # Show lab session management
        display_session_options()
    
    else:  # Equipment Booking
        # Enhanced header for the equipment booking section
        st.markdown("""
        <div style="background-color: rgba(111, 78, 55, 0.1); 
                    border-radius: 15px; 
                    padding: 1.5rem; 
                    margin: 1rem 0;">
            <h2 style="color: #3d2314; margin: 0; display: flex; align-items: center;">
                <span style="font-size: 1.5rem; margin-right: 0.5rem;">🧪</span> 
                Equipment Booking
            </h2>
            <p style="color: #666; margin-top: 0.5rem;">
                Reserve lab equipment for your experiments and research projects.
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        # Create a column layout with sidebar for filters
        with st.sidebar:
            st.markdown("""
            <div style="background-color: rgba(255, 255, 255, 0.8); 
                        border-radius: 15px; 
                        padding: 1rem; 
                        margin-bottom: 1rem;">
                <h3 style="color: #3d2314; border-bottom: 2px solid #e0d2c3; padding-bottom: 0.5rem;">
                    <i class="fas fa-filter"></i> Filter Equipment
                </h3>
            """, unsafe_allow_html=True)
            
            # Get unique categories for filter
            categories = set(e["category"] for e in st.session_state.equipment_data)
            category_filter = st.selectbox(
                "Category",
                ["All"] + sorted(list(categories))
            )
            
            status_filter = st.selectbox(
                "Status",
                ["All", "Available", "Booked", "Maintenance"]
            )
            
            search_term = st.text_input("Search Equipment", placeholder="Enter keywords...")
            
            st.markdown("</div>", unsafe_allow_html=True)
        
        # Filter equipment based on criteria
        filtered_equipment = filter_equipment(
            st.session_state.equipment_data,
            category_filter,
            status_filter,
            search_term
        )
        
        # Display equipment in a nice grid
        if not filtered_equipment:
            no_equipment_html = """
            <div style="background-color: rgba(255, 255, 255, 0.8); 
                        border-radius: 15px; 
                        padding: 2rem; 
                        text-align: center;
                        margin: 2rem 0;">
                <img src="https://cdn-icons-png.flaticon.com/512/6565/6565544.png" style="width: 80px; opacity: 0.5;">
                <h3 style="color: #6f4e37; margin-top: 1rem;">No Equipment Found</h3>
                <p style="color: #666;">No equipment matches your search criteria. Try adjusting your filters.</p>
            </div>
            """
            st.markdown(no_equipment_html, unsafe_allow_html=True)
        else:
            # Show number of items found
            st.markdown(f"""
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 1rem 0;">
                <h3 style="color: #3d2314; margin: 0;">Equipment List</h3>
                <span style="background-color: #e0d2c3; 
                           color: #3d2314; 
                           padding: 0.3rem 0.8rem; 
                           border-radius: 30px; 
                           font-size: 0.9rem;
                           font-weight: bold;">
                    {len(filtered_equipment)} items found
                </span>
            </div>
            """, unsafe_allow_html=True)
            
            # Display equipment as cards in a grid (3 columns)
            available_equipment = [e for e in filtered_equipment if e["status"] == "Available"]
            booked_equipment = [e for e in filtered_equipment if e["status"] != "Available"]
            
            # Display available equipment first
            if available_equipment:
                st.markdown("<h4 style='color: #5cb85c; margin-top: 1.5rem;'>Available Equipment</h4>", unsafe_allow_html=True)
                
                # Create rows with 3 columns each
                for i in range(0, len(available_equipment), 3):
                    cols = st.columns(3)
                    for j in range(3):
                        if i+j < len(available_equipment):
                            with cols[j]:
                                display_equipment_card(available_equipment[i+j])
            
            # Display booked/maintenance equipment
            if booked_equipment:
                st.markdown("<h4 style='color: #f0ad4e; margin-top: 1.5rem;'>Booked or Unavailable Equipment</h4>", unsafe_allow_html=True)
                
                # Create rows with 3 columns each
                for i in range(0, len(booked_equipment), 3):
                    cols = st.columns(3)
                    for j in range(3):
                        if i+j < len(booked_equipment):
                            with cols[j]:
                                display_equipment_card(booked_equipment[i+j])
        
        # Equipment booking section
        if available_equipment:
            st.markdown("""
            <div style="background-color: rgba(255, 255, 255, 0.8); 
                        border-radius: 15px; 
                        padding: 1.5rem; 
                        margin: 2rem 0;
                        box-shadow: 0 10px 20px rgba(0,0,0,0.05);">
                <h3 style="color: #3d2314; border-bottom: 2px solid #e0d2c3; padding-bottom: 0.5rem;">
                    Reserve Equipment
                </h3>
            """, unsafe_allow_html=True)
            
            # Equipment selection
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
                # Show the equipment details with nice styling
                st.markdown(f"""
                <div style="background-color: rgba(92, 184, 92, 0.1); 
                            border-left: 4px solid #5cb85c;
                            border-radius: 5px; 
                            padding: 1rem;">
                    <h4 style="color: #3d2314; margin: 0;">{equipment['name']}</h4>
                    <p style="margin: 0.5rem 0; color: #666; font-style: italic;">{equipment['description']}</p>
                    <p style="margin: 0.5rem 0;"><strong>Location:</strong> {equipment['location']}</p>
                    <p style="margin: 0.5rem 0;"><strong>Category:</strong> {equipment['category']}</p>
                </div>
                """, unsafe_allow_html=True)
                
                # Java-powered time slot selection with improved UI
                st.markdown("<h4 style='color: #3d2314; margin-top: 1.5rem;'>Booking Time</h4>", unsafe_allow_html=True)
                
                # Date selection with min/max restrictions
                today = datetime.today()
                max_date = today + timedelta(days=60)  # Allow booking up to 60 days in advance
                
                booking_date = st.date_input(
                    "Booking Date",
                    min_value=today,
                    max_value=max_date,
                    value=today
                )
                
                # Get Java bridge for time slots
                java_bridge = get_java_bridge()
                
                try:
                    # Generate time slots from Java
                    time_slots = java_bridge.generate_time_slots(8, 18, 30)
                    
                    # Time selection in two columns
                    col1, col2 = st.columns(2)
                    with col1:
                        start_time = st.selectbox(
                            "Start Time",
                            options=time_slots[:-1]  # Exclude the last time slot
                        )
                    
                    # Filter end times to only show times after the selected start time
                    start_idx = time_slots.index(start_time)
                    available_end_times = time_slots[start_idx+1:]
                    
                    with col2:
                        end_time = st.selectbox(
                            "End Time",
                            options=available_end_times
                        )
                except:
                    # Fallback to standard time input if Java bridge fails
                    col1, col2 = st.columns(2)
                    with col1:
                        start_time = st.time_input("Start Time", value=datetime.strptime("08:00", "%H:%M").time())
                    
                    with col2:
                        # Set a default end time 2 hours after start
                        default_end = datetime.combine(datetime.today(), start_time) + timedelta(hours=2)
                        end_time = st.time_input("End Time", value=default_end.time())
                
                # Format time display
                date_str = booking_date.strftime("%Y-%m-%d")
                
                if isinstance(start_time, str):
                    start_time_str = start_time
                else:
                    start_time_str = start_time.strftime("%H:%M")
                    
                if isinstance(end_time, str):
                    end_time_str = end_time
                else:
                    end_time_str = end_time.strftime("%H:%M")
                
                # Show the selected time range in a nice info box
                st.markdown(f"""
                <div style="background-color: rgba(111, 78, 55, 0.1); 
                            border-radius: 10px; 
                            padding: 1rem; 
                            margin: 1rem 0; 
                            text-align: center;
                            font-weight: bold;
                            color: #3d2314;">
                    You selected: {booking_date.strftime("%A, %B %d, %Y")} from {start_time_str} to {end_time_str}
                </div>
                """, unsafe_allow_html=True)
                
                # Time slot availability calendar
                st.markdown("<h4 style='color: #3d2314; margin-top: 1.5rem;'>Equipment Availability</h4>", unsafe_allow_html=True)
                
                # Generate and display the calendar view
                calendar_html = generate_calendar_view(st.session_state.booking_data, equipment_id)
                st.markdown(calendar_html, unsafe_allow_html=True)
                
                # Purpose of booking
                st.markdown("<h4 style='color: #3d2314; margin-top: 1.5rem;'>Booking Details</h4>", unsafe_allow_html=True)
                purpose = st.text_area(
                    "Purpose of Booking", 
                    height=100,
                    placeholder="Explain how you plan to use this equipment and for what project or experiment..."
                )
                
                # Book button
                if st.button("Book Equipment", use_container_width=True):
                    with st.spinner("Processing your booking..."):
                        time.sleep(0.5)  # Add a small delay for UX
                        
                        if not purpose:
                            st.error("Please provide the purpose of booking.")
                        else:
                            # Check for booking conflicts
                            is_available = True
                            for booking in st.session_state.booking_data:
                                if booking["equipment_id"] == equipment_id and booking["status"] == "Confirmed":
                                    # For bookings with time slots
                                    if booking["start_date"] == date_str and "start_time" in booking and "end_time" in booking:
                                        booking_start = booking["start_time"]
                                        booking_end = booking["end_time"]
                                        
                                        # Check if time periods overlap
                                        if (start_time_str <= booking_end and end_time_str >= booking_start):
                                            is_available = False
                                            break
                            
                            if not is_available:
                                st.error("The selected time slot is not available. Please choose another time.")
                            else:
                                # Create new booking with time slots
                                new_booking = {
                                    "id": len(st.session_state.booking_data) + 1,
                                    "user_email": st.session_state.user_email,
                                    "equipment_id": equipment_id,
                                    "start_date": date_str,
                                    "end_date": date_str,  # Same day booking with time slots
                                    "start_time": start_time_str,
                                    "end_time": end_time_str,
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
                                st.success(f"Successfully booked {equipment['name']} on {date_str} from {start_time_str} to {end_time_str}")
                                st.balloons()  # Add a fun animation
                                time.sleep(1)  # Show success message
                                st.rerun()
            
            st.markdown("</div>", unsafe_allow_html=True)
        
        # My Bookings Section with enhanced styling
        st.markdown("""
        <div style="background-color: rgba(255, 255, 255, 0.8); 
                    border-radius: 15px; 
                    padding: 1.5rem; 
                    margin: 2rem 0;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);">
            <h3 style="color: #3d2314; border-bottom: 2px solid #e0d2c3; padding-bottom: 0.5rem;">
                My Bookings
            </h3>
        """, unsafe_allow_html=True)
        
        user_bookings = [b for b in st.session_state.booking_data if b["user_email"] == st.session_state.user_email]
        
        if not user_bookings:
            no_bookings_html = """
            <div style="text-align: center; padding: 2rem 0;">
                <img src="https://cdn-icons-png.flaticon.com/512/6565/6565544.png" style="width: 80px; opacity: 0.5;">
                <h4 style="color: #6f4e37; margin-top: 1rem;">No Bookings Found</h4>
                <p style="color: #666;">You haven't made any equipment bookings yet.</p>
            </div>
            """
            st.markdown(no_bookings_html, unsafe_allow_html=True)
        else:
            # Create tabs for different booking statuses
            tab1, tab2, tab3 = st.tabs(["Active", "Completed", "Cancelled"])
            
            # Filter bookings by status
            active_bookings = [b for b in user_bookings if b["status"] == "Confirmed"]
            completed_bookings = [b for b in user_bookings if b["status"] == "Completed"]
            cancelled_bookings = [b for b in user_bookings if b["status"] == "Cancelled"]
            
            # Display active bookings
            with tab1:
                if not active_bookings:
                    st.info("You don't have any active bookings.")
                else:
                    for booking in active_bookings:
                        equipment = next((e for e in st.session_state.equipment_data if e["id"] == booking["equipment_id"]), None)
                        equipment_name = equipment["name"] if equipment else "Unknown Equipment"
                        
                        booking_html = f"""
                        <div style="background-color: rgba(255, 255, 255, 0.8); 
                                    border-radius: 10px; 
                                    padding: 1rem; 
                                    margin-bottom: 1rem;
                                    border-left: 4px solid #5cb85c;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <h4 style="margin: 0; color: #3d2314;">{equipment_name}</h4>
                                <span style="background-color: #5cb85c; 
                                            color: white; 
                                            padding: 0.2rem 0.5rem; 
                                            border-radius: 20px; 
                                            font-size: 0.8rem;
                                            font-weight: bold;">
                                    Active
                                </span>
                            </div>
                            <p style="margin: 0.5rem 0 0 0;">
                                <strong>Date:</strong> {booking["start_date"]}
                            </p>
                        """
                        
                        # Add time information if available
                        if "start_time" in booking and "end_time" in booking:
                            booking_html += f"""
                            <p style="margin: 0.2rem 0 0 0;">
                                <strong>Time:</strong> {booking["start_time"]} - {booking["end_time"]}
                            </p>
                            """
                        
                        booking_html += f"""
                            <p style="margin: 0.2rem 0 0 0;">
                                <strong>Purpose:</strong> {booking["purpose"]}
                            </p>
                            <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem; color: #666;">
                                Booked on: {booking["timestamp"]}
                            </p>
                        </div>
                        """
                        
                        st.markdown(booking_html, unsafe_allow_html=True)
                        
                        # Cancel button
                        if st.button(f"Cancel Booking #{booking['id']}", key=f"cancel_active_{booking['id']}"):
                            # Update booking status
                            with st.spinner("Processing cancellation..."):
                                time.sleep(0.5)  # Add a small delay for UX
                                
                                for i, b in enumerate(st.session_state.booking_data):
                                    if b["id"] == booking["id"]:
                                        st.session_state.booking_data[i]["status"] = "Cancelled"
                                        
                                        # Update equipment status back to Available
                                        equipment_id = b["equipment_id"]
                                        for j, equip in enumerate(st.session_state.equipment_data):
                                            if equip["id"] == equipment_id:
                                                st.session_state.equipment_data[j]["status"] = "Available"
                                                break
                                        
                                        st.success("Booking cancelled successfully.")
                                        time.sleep(1)  # Show success message
                                        st.rerun()
                                        break
            
            # Display completed bookings
            with tab2:
                if not completed_bookings:
                    st.info("You don't have any completed bookings.")
                else:
                    for booking in completed_bookings:
                        equipment = next((e for e in st.session_state.equipment_data if e["id"] == booking["equipment_id"]), None)
                        equipment_name = equipment["name"] if equipment else "Unknown Equipment"
                        
                        booking_html = f"""
                        <div style="background-color: rgba(255, 255, 255, 0.8); 
                                    border-radius: 10px; 
                                    padding: 1rem; 
                                    margin-bottom: 1rem;
                                    border-left: 4px solid #6c757d;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <h4 style="margin: 0; color: #3d2314;">{equipment_name}</h4>
                                <span style="background-color: #6c757d; 
                                            color: white; 
                                            padding: 0.2rem 0.5rem; 
                                            border-radius: 20px; 
                                            font-size: 0.8rem;
                                            font-weight: bold;">
                                    Completed
                                </span>
                            </div>
                            <p style="margin: 0.5rem 0 0 0;">
                                <strong>Date:</strong> {booking["start_date"]}
                            </p>
                        """
                        
                        # Add time information if available
                        if "start_time" in booking and "end_time" in booking:
                            booking_html += f"""
                            <p style="margin: 0.2rem 0 0 0;">
                                <strong>Time:</strong> {booking["start_time"]} - {booking["end_time"]}
                            </p>
                            """
                        
                        booking_html += f"""
                            <p style="margin: 0.2rem 0 0 0;">
                                <strong>Purpose:</strong> {booking["purpose"]}
                            </p>
                            <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem; color: #666;">
                                Booked on: {booking["timestamp"]}
                            </p>
                        </div>
                        """
                        
                        st.markdown(booking_html, unsafe_allow_html=True)
            
            # Display cancelled bookings
            with tab3:
                if not cancelled_bookings:
                    st.info("You don't have any cancelled bookings.")
                else:
                    for booking in cancelled_bookings:
                        equipment = next((e for e in st.session_state.equipment_data if e["id"] == booking["equipment_id"]), None)
                        equipment_name = equipment["name"] if equipment else "Unknown Equipment"
                        
                        booking_html = f"""
                        <div style="background-color: rgba(255, 255, 255, 0.8); 
                                    border-radius: 10px; 
                                    padding: 1rem; 
                                    margin-bottom: 1rem;
                                    border-left: 4px solid #d9534f;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <h4 style="margin: 0; color: #3d2314;">{equipment_name}</h4>
                                <span style="background-color: #d9534f; 
                                            color: white; 
                                            padding: 0.2rem 0.5rem; 
                                            border-radius: 20px; 
                                            font-size: 0.8rem;
                                            font-weight: bold;">
                                    Cancelled
                                </span>
                            </div>
                            <p style="margin: 0.5rem 0 0 0;">
                                <strong>Date:</strong> {booking["start_date"]}
                            </p>
                        """
                        
                        # Add time information if available
                        if "start_time" in booking and "end_time" in booking:
                            booking_html += f"""
                            <p style="margin: 0.2rem 0 0 0;">
                                <strong>Time:</strong> {booking["start_time"]} - {booking["end_time"]}
                            </p>
                            """
                        
                        booking_html += f"""
                            <p style="margin: 0.2rem 0 0 0;">
                                <strong>Purpose:</strong> {booking["purpose"]}
                            </p>
                            <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem; color: #666;">
                                Booked on: {booking["timestamp"]}
                            </p>
                        </div>
                        """
                        
                        st.markdown(booking_html, unsafe_allow_html=True)
        
        st.markdown("</div>", unsafe_allow_html=True)
    
    # Add footer
    create_footer()
