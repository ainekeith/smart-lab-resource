import streamlit as st
import pandas as pd
from streamlit_option_menu import option_menu
import auth
import dashboard
import booking
import profile
import settings
import database
import base64
from PIL import Image
import io

# Page configuration
st.set_page_config(
    page_title="Smart Lab Resource Management System",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="expanded"
)

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
    st.session_state.equipment_data = database.initialize_equipment()
if 'booking_data' not in st.session_state:
    st.session_state.booking_data = []
if 'current_page' not in st.session_state:
    st.session_state.current_page = "dashboard"

# Display badge at the top of every page
def display_badge():
    st.image("assets/badge.png", width=150)
    st.title("Soroti University Smart Lab")
    st.markdown("### Resource Management System")
    st.markdown("---")

# Navigation
def display_navigation():
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
                auth.logout()
                st.rerun()
        
        # Display appropriate page based on current_page
        if st.session_state.current_page == "dashboard":
            dashboard.show_dashboard()
        elif st.session_state.current_page == "booking":
            booking.show_booking_page()
        elif st.session_state.current_page == "manage" and is_admin:
            import equipment_management
            equipment_management.show_equipment_management()
        elif st.session_state.current_page == "profile":
            profile.show_profile()
        elif st.session_state.current_page == "settings":
            settings.show_settings()
    else:
        display_badge()
        auth.show_auth_page()

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
    
    display_navigation()

if __name__ == "__main__":
    main()
