import streamlit as st
import pandas as pd
import database
from datetime import datetime, timedelta
import booking

def show_dashboard():
    st.image("assets/badge.png", width=150)
    st.title("Dashboard")
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
            st.switch_page("booking.py")
    else:
        st.info("You haven't made any bookings yet.")
        if st.button("Book Equipment Now"):
            st.switch_page("booking.py")
    
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
