import streamlit as st
import base64
from PIL import Image
import io
from datetime import datetime, timedelta

def display_success(message):
    """Display success message with formatting"""
    st.markdown(f"<div style='padding: 10px; background-color: #d4edda; color: #155724; border-radius: 5px;'>{message}</div>", unsafe_allow_html=True)

def display_error(message):
    """Display error message with formatting"""
    st.markdown(f"<div style='padding: 10px; background-color: #f8d7da; color: #721c24; border-radius: 5px;'>{message}</div>", unsafe_allow_html=True)

def display_info(message):
    """Display info message with formatting"""
    st.markdown(f"<div style='padding: 10px; background-color: #d1ecf1; color: #0c5460; border-radius: 5px;'>{message}</div>", unsafe_allow_html=True)

def validate_date_range(start_date, end_date):
    """Validate that end date is after start date"""
    if end_date < start_date:
        return False
    return True

def check_booking_conflict(equipment_id, start_date, end_date, booking_data, exclude_booking_id=None):
    """
    Check if there's a booking conflict
    Returns True if there is a conflict, False otherwise
    """
    for booking in booking_data:
        # Skip the booking if it's the one being updated
        if exclude_booking_id and booking["id"] == exclude_booking_id:
            continue
            
        if booking["equipment_id"] == equipment_id and booking["status"] == "Confirmed":
            booking_start = datetime.strptime(booking["start_date"], "%Y-%m-%d").date()
            booking_end = datetime.strptime(booking["end_date"], "%Y-%m-%d").date()
            
            # Check for overlap
            if (start_date <= booking_end and end_date >= booking_start):
                return True
    
    return False

def get_upcoming_bookings(user_email, booking_data, days=7):
    """Get upcoming bookings within the specified number of days"""
    today = datetime.now().date()
    upcoming = []
    
    for booking in booking_data:
        if booking["user_email"] == user_email and booking["status"] == "Confirmed":
            start_date = datetime.strptime(booking["start_date"], "%Y-%m-%d").date()
            
            # Check if the booking is within the specified days
            if today <= start_date <= today + timedelta(days=days):
                upcoming.append(booking)
    
    return upcoming

def get_equipment_availability(equipment_id, booking_data, days=30):
    """
    Get availability of equipment for the next n days
    Returns a list of dates when the equipment is booked
    """
    today = datetime.now().date()
    booked_dates = []
    
    for booking in booking_data:
        if booking["equipment_id"] == equipment_id and booking["status"] == "Confirmed":
            start = datetime.strptime(booking["start_date"], "%Y-%m-%d").date()
            end = datetime.strptime(booking["end_date"], "%Y-%m-%d").date()
            
            # Add all dates in the range to booked_dates
            current = start
            while current <= end:
                if today <= current <= today + timedelta(days=days):
                    booked_dates.append(current)
                current += timedelta(days=1)
    
    return booked_dates
