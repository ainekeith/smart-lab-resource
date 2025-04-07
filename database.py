import streamlit as st
from datetime import datetime, timedelta

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
