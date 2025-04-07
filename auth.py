import streamlit as st
import re
import time
import random
from email_validator import validate_email, EmailNotValidError
import database
from PIL import Image, ImageDraw, ImageFont
import base64
import io

# Import styles if available, otherwise define basic styling functions
try:
    from styles import (
        set_background_image, 
        apply_custom_styles, 
        centered_title, 
        info_card, 
        animate_on_hover,
        create_footer
    )
except ImportError:
    # Fallback basic styling functions
    def set_background_image(image_file, opacity=0.3):
        """Basic background image setter"""
        try:
            with open(image_file, "rb") as f:
                img_data = f.read()
                b64_encoded = base64.b64encode(img_data).decode()
                
            background_css = f"""
            <style>
            .stApp {{
                background-image: url(data:image/png;base64,{b64_encoded});
                background-size: cover;
                background-repeat: no-repeat;
                background-attachment: fixed;
            }}
            .stApp::before {{
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, {1-opacity});
                z-index: -1;
            }}
            </style>
            """
            st.markdown(background_css, unsafe_allow_html=True)
        except Exception as e:
            print(f"Error setting background: {e}")
    
    def apply_custom_styles():
        """Apply basic custom CSS"""
        st.markdown("""
        <style>
        h1, h2, h3 { color: #3d2314; font-weight: bold; }
        button.stButton > button { background-color: #6f4e37; color: white; border-radius: 10px; }
        </style>
        """, unsafe_allow_html=True)
    
    def centered_title(title, subtitle=None):
        """Simple centered title"""
        st.markdown(f"<h1 style='text-align: center;'>{title}</h1>", unsafe_allow_html=True)
        if subtitle:
            st.markdown(f"<h3 style='text-align: center;'>{subtitle}</h3>", unsafe_allow_html=True)
    
    def info_card(title, content, icon="ℹ️"):
        """Simple info card"""
        st.markdown(f"**{icon} {title}**\n\n{content}")
    
    def animate_on_hover():
        """Basic hover animation"""
        pass
    
    def create_footer():
        """Simple footer"""
        st.markdown("---\n© 2025 S-Lab - Soroti University", unsafe_allow_html=True)

def is_valid_email(email):
    """Validate email format with improved error handling"""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False
    except Exception:
        return False

def get_random_lab_icon():
    """Return a random lab-related emoji for dynamic UI elements"""
    icons = ["🧪", "🔬", "🧫", "🧬", "⚗️", "🔭", "🔋", "🔌", "📡", "💊", "💉", "🧰"]
    return random.choice(icons)

def create_wavey_background():
    """Create a decorative wave pattern background for auth page"""
    wave_svg = """
    <div class="auth-background">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#6f4e37" fill-opacity="0.1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,213.3C672,213,768,203,864,181.3C960,160,1056,128,1152,117.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style="position: absolute; bottom: 0;">
            <path fill="#3d2314" fill-opacity="0.1" d="M0,96L48,122.7C96,149,192,203,288,234.7C384,267,480,277,576,261.3C672,245,768,203,864,176C960,149,1056,139,1152,149.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
    </div>
    <style>
    .auth-background {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        overflow: hidden;
    }
    .stApp { position: relative; }
    </style>
    """
    st.markdown(wave_svg, unsafe_allow_html=True)

def display_badge_header():
    """Display the university badge with enhanced styling"""
    col1, col2 = st.columns([1, 3])
    with col1:
        st.image("assets/badge.png", width=180)
    with col2:
        st.markdown("<h1 style='margin-bottom:0; color: #3d2314; font-size: 2.5rem; font-weight: bold;'>SOROTI UNIVERSITY</h1>", unsafe_allow_html=True)
        st.markdown("<h2 style='margin-top:0; color: #6f4e37; font-style: italic;'>Smart Lab Resource Management System</h2>", unsafe_allow_html=True)

def display_system_description():
    """Display an attractive description about the S-Lab system"""
    description_html = """
    <div style="background-color: rgba(255, 255, 255, 0.8); 
                border-radius: 15px; 
                padding: 1.5rem; 
                margin: 1.5rem 0; 
                box-shadow: 0 10px 20px rgba(0,0,0,0.05);">
        <h3 style="color: #3d2314; border-bottom: 2px solid #6f4e37; padding-bottom: 0.5rem;">
            Welcome to S-Lab
        </h3>
        <p style="color: #333; line-height: 1.6; margin-top: 1rem;">
            <strong>S-Lab</strong> is a highly advanced, web-based platform designed to efficiently manage laboratory resources 
            at Soroti University. The system enables students, lecturers, and lab technicians to:
        </p>
        <ul style="color: #333; line-height: 1.6;">
            <li><strong style="color: #6f4e37;">Book Equipment</strong> - Reserve lab equipment for specific time periods</li>
            <li><strong style="color: #6f4e37;">Schedule Lab Sessions</strong> - Organize and participate in group lab sessions</li>
            <li><strong style="color: #6f4e37;">Manage Resources</strong> - Track usage and availability of laboratory resources</li>
            <li><strong style="color: #6f4e37;">Coordinate Activities</strong> - Streamline communication between students and staff</li>
        </ul>
        <p style="color: #333; line-height: 1.6;">
            With an intuitive interface and powerful features, S-Lab simplifies the complexity of
            laboratory resource management while enhancing the academic experience.
        </p>
    </div>
    """
    st.markdown(description_html, unsafe_allow_html=True)

def animated_button_css():
    """Return CSS for animated buttons"""
    return """
    <style>
    div[data-testid="stButton"] > button {
        background-color: #6f4e37;
        color: white;
        border: none;
        border-radius: 30px;
        padding: 10px 20px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    div[data-testid="stButton"] > button:hover {
        background-color: #3d2314;
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    div[data-testid="stButton"] > button:active {
        transform: translateY(0);
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    div[data-testid="stButton"] > button::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 5px;
        height: 5px;
        background: rgba(255, 255, 255, 0.5);
        opacity: 0;
        border-radius: 100%;
        transform: scale(1, 1) translate(-50%);
        transform-origin: 50% 50%;
    }
    
    div[data-testid="stButton"] > button:focus:not(:active)::after {
        animation: ripple 1s ease-out;
    }
    
    @keyframes ripple {
        0% { transform: scale(0, 0); opacity: 0; }
        20% { transform: scale(25, 25); opacity: 0.2; }
        100% { opacity: 0; transform: scale(40, 40); }
    }
    </style>
    """

def show_auth_page():
    """Display enhanced authentication page with styling"""
    # Apply background image from either source
    try:
        set_background_image("assets/backgrounds/lab_pattern.svg", opacity=0.15)
    except:
        try:
            set_background_image("assets/badge.png", opacity=0.08)
        except:
            pass
            
    # Apply custom styles
    apply_custom_styles()
    create_wavey_background()
    st.markdown(animated_button_css(), unsafe_allow_html=True)
    
    # Display header with logo
    display_badge_header()
    
    # Add some space
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Create a two-column layout
    col1, col2 = st.columns([3, 2])
    
    with col1:
        # Create custom styled tabs
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
        
        /* Style form containers */
        div.row-widget.stRadio > div {
            background-color: rgba(255, 255, 255, 0.7);
            padding: 1rem;
            border-radius: 10px;
        }
        
        /* Style text inputs */
        div[data-baseweb="input"], div[data-baseweb="select"] {
            margin-bottom: 1rem;
        }
        
        div[data-baseweb="input"] input, div[data-baseweb="select"] input {
            border-radius: 8px;
            padding: 0.5rem;
            border: 1px solid #e0d2c3;
        }
        </style>
        """
        st.markdown(tab_css, unsafe_allow_html=True)
        
        # Create tabs for login/register
        tab1, tab2 = st.tabs(["Login", "Register"])
        
        with tab1:
            # Enhanced login form with styling
            st.markdown(f"""
            <div style="background-color: rgba(255, 255, 255, 0.8); 
                        border-radius: 15px; 
                        padding: 1.5rem; 
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1); 
                        border: 1px solid #e0d2c3;
                        margin-bottom: 1rem;">
                <h3 style="color: #3d2314; margin-bottom: 1.5rem; border-bottom: 2px solid #e0d2c3; padding-bottom: 0.5rem;">
                    <span style="font-size: 1.5rem; margin-right: 0.5rem;">{get_random_lab_icon()}</span> 
                    <span style="font-style: italic;">Login to your account</span>
                </h3>
            """, unsafe_allow_html=True)
            
            email = st.text_input("Email Address", placeholder="Enter your university email", key="login_email")
            password = st.text_input("Password", type="password", placeholder="Enter your password", key="login_password")
            
            # Remember me checkbox with styling
            col1, col2 = st.columns([1, 1])
            with col1:
                remember_me = st.checkbox("Remember me", key="remember_login")
            
            # Login button
            if st.button("Login", key="login_button", use_container_width=True):
                # Show loading animation
                with st.spinner("Logging in..."):
                    time.sleep(0.5)  # Simulate loading
                    
                    if not email or not password:
                        st.error("Please enter both email and password")
                    elif not is_valid_email(email):
                        st.error("Please enter a valid email address")
                    else:
                        user = database.get_user(email)
                        if user and user["password"] == password:
                            st.success("Login successful! Redirecting to dashboard...")
                            time.sleep(0.5)  # Slight delay for better UX
                            st.session_state.logged_in = True
                            st.session_state.user_email = email
                            st.session_state.user_data = user
                            st.rerun()
                        else:
                            st.error("Invalid email or password")
            
            st.markdown("</div>", unsafe_allow_html=True)
        
        with tab2:
            # Enhanced registration form
            st.markdown(f"""
            <div style="background-color: rgba(255, 255, 255, 0.8); 
                        border-radius: 15px; 
                        padding: 1.5rem; 
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1); 
                        border: 1px solid #e0d2c3;
                        margin-bottom: 1rem;">
                <h3 style="color: #3d2314; margin-bottom: 1.5rem; border-bottom: 2px solid #e0d2c3; padding-bottom: 0.5rem;">
                    <span style="font-size: 1.5rem; margin-right: 0.5rem;">{get_random_lab_icon()}</span> 
                    <span style="font-style: italic;">Create a new account</span>
                </h3>
            """, unsafe_allow_html=True)
            
            # Personal information
            st.markdown("<h4 style='color: #6f4e37; margin-top: 0.5rem;'>Personal Information</h4>", unsafe_allow_html=True)
            
            col1, col2 = st.columns(2)
            with col1:
                first_name = st.text_input("First Name", placeholder="Enter your first name", key="first_name")
            with col2:
                last_name = st.text_input("Last Name", placeholder="Enter your last name", key="last_name")
            
            new_email = st.text_input("Email Address", placeholder="Enter your university email", key="register_email")
            
            col1, col2 = st.columns(2)
            with col1:
                new_password = st.text_input("Password", type="password", key="register_password", 
                                          placeholder="Create a strong password")
            with col2:
                confirm_password = st.text_input("Confirm Password", type="password", key="confirm_password", 
                                             placeholder="Repeat your password")
            
            # Academic information
            st.markdown("<h4 style='color: #6f4e37; margin-top: 1.5rem;'>Academic Information</h4>", unsafe_allow_html=True)
            
            # User category with enhanced styling
            st.markdown("""
            <style>
            div.row-widget.stRadio > div {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 10px;
            }
            div.row-widget.stRadio > div > label {
                background-color: rgba(224, 210, 195, 0.5);
                border-radius: 20px;
                padding: 8px 15px;
                flex: 1 1 auto;
                text-align: center;
                transition: all 0.3s ease;
            }
            div.row-widget.stRadio > div > label:hover {
                background-color: rgba(111, 78, 55, 0.2);
                transform: translateY(-2px);
            }
            div.row-widget.stRadio > div [data-testid="stMarkdownContainer"] p {
                font-weight: bold;
                color: #3d2314;
            }
            </style>
            """, unsafe_allow_html=True)
            
            user_category = st.selectbox(
                "Select your category",
                options=["Student", "Lecturer", "Lab Technician"],
                index=0,
                key="user_category"
            )
            
            col1, col2 = st.columns(2)
            with col1:
                department = st.selectbox(
                    "Department",
                    options=["Computer Science", "Physics", "Chemistry", "Biology", "Engineering", "Mathematics", "Other"],
                    key="department"
                )
            
            # Additional fields based on category
            if user_category == "Student":
                with col2:
                    student_id = st.text_input("Student ID", placeholder="Enter your student ID", key="student_id")
                
                year_of_study = st.selectbox(
                    "Year of Study",
                    options=["1", "2", "3", "4", "5", "6"],
                    index=0,
                    key="year_of_study"
                )
                
            elif user_category == "Lecturer":
                with col2:
                    staff_id = st.text_input("Staff ID", placeholder="Enter your staff ID", key="staff_id")
                
            elif user_category == "Lab Technician":
                with col2:
                    staff_id = st.text_input("Staff ID", placeholder="Enter your staff ID", key="tech_staff_id")
                
                lab_section = st.selectbox(
                    "Lab Section",
                    options=["Computer Lab", "Physics Lab", "Chemistry Lab", "Biology Lab", "Engineering Lab", "General Lab"],
                    key="lab_section"
                )
            
            # Terms and confirmation
            st.markdown("<h4 style='color: #6f4e37; margin-top: 1.5rem;'>Confirmation</h4>", unsafe_allow_html=True)
            
            agree = st.checkbox("I agree to the Terms and Conditions of Soroti University S-Lab", key="agree")
            
            # Register button
            if st.button("Create Account", key="register_button", use_container_width=True):
                # Show loading animation
                with st.spinner("Creating your account..."):
                    time.sleep(0.5)  # Simulate loading
                    
                    # Input validation
                    if not new_email or not new_password or not confirm_password or not first_name or not last_name:
                        st.error("Please fill in all required fields")
                    elif not is_valid_email(new_email):
                        st.error("Please enter a valid email address")
                    elif new_password != confirm_password:
                        st.error("Passwords do not match")
                    elif len(new_password) < 8:
                        st.error("Password should be at least 8 characters long")
                    elif not agree:
                        st.error("You must agree to the Terms and Conditions")
                    elif database.get_user(new_email):
                        st.error("Email already registered")
                    else:
                        # Create user data with category information
                        user_data = {
                            "user_category": user_category,
                            "first_name": first_name,
                            "last_name": last_name,
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
                        database.add_user(new_email, new_password, user_data)
                        st.success("Account created successfully! You can now login.")
            
            st.markdown("</div>", unsafe_allow_html=True)  # Close the register container
    
    with col2:
        # Display system description
        display_system_description()
        
        # System features
        st.markdown("<h4 style='color: #3d2314; margin-top: 2rem;'>System Features</h4>", unsafe_allow_html=True)
        
        features = [
            {
                "icon": "🧪",
                "title": "Lab Equipment Booking",
                "description": "Reserve specialized equipment for your experiments and research."
            },
            {
                "icon": "📅",
                "title": "Session Scheduling",
                "description": "Organize and join lab sessions with ease."
            },
            {
                "icon": "👥",
                "title": "Team Collaboration",
                "description": "Coordinate with lab partners and instructors effectively."
            }
        ]
        
        for feature in features:
            feature_html = f"""
            <div style="background-color: rgba(255, 255, 255, 0.7); 
                        border-radius: 10px; 
                        padding: 1rem; 
                        margin-bottom: 1rem;
                        border-left: 4px solid #6f4e37;
                        transition: transform 0.3s ease, box-shadow 0.3s ease;"
                 onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 10px 20px rgba(0,0,0,0.1)';"
                 onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none';">
                <div style="display: flex; align-items: center;">
                    <div style="font-size: 2rem; margin-right: 1rem;">{feature['icon']}</div>
                    <div>
                        <h5 style="margin: 0; color: #3d2314; font-weight: bold;">{feature['title']}</h5>
                        <p style="margin: 0.3rem 0 0 0; font-size: 0.9rem;">{feature['description']}</p>
                    </div>
                </div>
            </div>
            """
            st.markdown(feature_html, unsafe_allow_html=True)
    
    # Add a footer
    create_footer()

def logout():
    """Enhanced logout with animation"""
    # Show loading animation during logout
    with st.spinner("Logging out..."):
        time.sleep(0.5)  # Simulate loading
        
        st.session_state.logged_in = False
        st.session_state.user_email = ""
        st.session_state.user_data = {}
        
        # Add success message when logging out
        st.success("Logged out successfully. Redirecting...")
        time.sleep(0.3)  # Small delay
