import streamlit as st
import base64
from PIL import Image
import io
import os

def set_background_image(image_file="assets/backgrounds/fancy_lab_background.svg", opacity=0.3):
    """
    Set a background image for a Streamlit page with custom opacity
    
    Args:
        image_file (str): Path to the image file
        opacity (float): Opacity level (0 to 1)
    """
    try:
        # Use SVG background if it exists, otherwise use the badge
        if not os.path.exists(image_file):
            image_file = "assets/badge.png"
            
        # Get file extension
        file_ext = image_file.split('.')[-1].lower()
        
        # Open the image and convert to base64
        with open(image_file, "rb") as f:
            img_data = f.read()
            b64_encoded = base64.b64encode(img_data).decode()
        
        # Determine content type based on extension
        content_type = "image/svg+xml" if file_ext == "svg" else f"image/{file_ext}"
        
        # Create CSS with the background image
        background_css = f"""
        <style>
        .stApp {{
            background-image: url(data:{content_type};base64,{b64_encoded});
            background-size: cover;
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-position: center;
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
        st.error(f"Error setting background image: {e}")
        # Fallback to a simple gradient background
        fallback_bg = """
        <style>
        .stApp {
            background: linear-gradient(135deg, #fcfaf7 0%, #e0d2c3 100%);
        }
        </style>
        """
        st.markdown(fallback_bg, unsafe_allow_html=True)

def apply_custom_styles():
    """Apply custom CSS styles to enhance the UI"""
    
    # First, load the custom buttons CSS
    try:
        with open("assets/buttons/buttons.css", "r") as f:
            buttons_css = f.read()
    except:
        # Fallback buttons CSS if file not found
        buttons_css = """
        /* Main button styles fallback */
        .stButton > button {
            border-radius: 10px;
            padding: 0.5rem 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        /* Primary button */
        .primary-btn button {
            background-color: #6E432C !important;
            color: white !important;
        }
        """
    
    # Embed the CSS into the HTML using the f-string
    custom_css = f"""
    <style>
    /* Import custom button styles */
    {buttons_css}
    
    /* Card-like containers for items */
    div.stExpander {{
        border: 1px solid #e0d2c3;
        border-radius: 10px;
        box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }}
    
    div.stExpander:hover {{
        transform: translateY(-5px);
        box-shadow: 3px 3px 8px rgba(0,0,0,0.2);
    }}
    
    /* Ripple effect */
    .ripple {{
        position: relative;
        overflow: hidden;
    }}
    
    .ripple:after {{
        content: "";
        display: block;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
        background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
        background-repeat: no-repeat;
        background-position: 50%;
        transform: scale(10, 10);
        opacity: 0;
        transition: transform 0.5s, opacity 1s;
    }}
    
    .ripple:active:after {{
        transform: scale(0, 0);
        opacity: 0.3;
        transition: 0s;
    }}
    
    /* Input fields */
    div[data-baseweb="input"] input, 
    div[data-baseweb="textarea"] textarea {{
        border-radius: 8px;
        border: 1px solid #e0d2c3;
        transition: all 0.3s ease;
    }}
    
    div[data-baseweb="input"] input:focus, 
    div[data-baseweb="textarea"] textarea:focus {{
        border-color: #6f4e37;
        box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.2);
    }}
    
    /* Headers */
    h1, h2, h3 {{
        color: #3d2314;
        font-weight: bold;
    }}
    
    /* Sidebar */
    section[data-testid="stSidebar"] {{
        background-color: #f8f4f0;
        border-right: 1px solid #e0d2c3;
    }}
    
    /* Dataframes */
    .stDataFrame {{
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }}
    
    /* Text highlights */
    .highlight {{
        background-color: #f0e6d9;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-weight: bold;
    }}
    
    /* Badges */
    .badge {{
        display: inline-block;
        border-radius: 30px;
        padding: 0.2rem 0.8rem;
        font-size: 0.8rem;
        font-weight: bold;
        margin-right: 0.5rem;
    }}
    
    .badge-success {{
        background-color: #5cb85c;
        color: white;
    }}
    
    .badge-warning {{
        background-color: #f0ad4e;
        color: white;
    }}
    
    .badge-danger {{
        background-color: #d9534f;
        color: white;
    }}
    
    /* Improved tabs */
    button[data-baseweb="tab"] {{
        background-color: transparent;
        border-bottom: 2px solid transparent;
        border-radius: 0;
        margin-right: 1rem;
        font-weight: bold;
        color: #6f4e37;
        transition: all 0.3s ease;
    }}
    
    button[data-baseweb="tab"][aria-selected="true"] {{
        background-color: transparent;
        border-bottom: 2px solid #6f4e37;
        color: #3d2314;
    }}
    
    button[data-baseweb="tab"]:hover {{
        color: #3d2314;
        border-bottom: 2px solid rgba(111, 78, 55, 0.3);
    }}
    
    /* Custom Cards */
    .fancy-card {{
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        transition: all 0.3s ease;
        border-left: 4px solid #6f4e37;
    }}
    
    .fancy-card:hover {{
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        transform: translateY(-5px);
    }}
    
    /* Typography Enhancements */
    .bold-text {{
        font-weight: bold;
        color: #3d2314;
    }}
    
    .italic-text {{
        font-style: italic;
        color: #6f4e37;
    }}
    
    .fancy-title {{
        font-size: 1.8rem;
        color: #3d2314;
        margin-bottom: 1rem;
        position: relative;
        padding-bottom: 0.5rem;
    }}
    
    .fancy-title:after {{
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 50px;
        height: 3px;
        background: linear-gradient(to right, #8B6030, #6f4e37);
        border-radius: 3px;
    }}
    </style>
    """
    # Inject the CSS into the Streamlit app
    st.markdown(custom_css, unsafe_allow_html=True)
    st.markdown(custom_css, unsafe_allow_html=True)

def centered_title(title, subtitle=None):
    """Display a centered title with an optional subtitle"""
    title_html = f"""
    <div style="text-align: center; padding: 1rem 0;">
        <h1 style="color: #3d2314; font-size: 2.5rem; margin-bottom: 0.5rem;">{title}</h1>
    """
    
    if subtitle:
        title_html += f'<h3 style="color: #6f4e37; font-weight: normal; margin-top: 0;">{subtitle}</h3>'
    
    title_html += "</div>"
    st.markdown(title_html, unsafe_allow_html=True)

def info_card(title, content, icon="ℹ️"):
    """Display information in a styled card"""
    card_html = f"""
    <div style="background-color: rgba(224, 210, 195, 0.7); 
                border-radius: 10px; 
                padding: 1rem; 
                margin: 1rem 0; 
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center;">
            <div style="font-size: 1.5rem; margin-right: 0.8rem;">{icon}</div>
            <div>
                <h4 style="margin: 0; color: #3d2314;">{title}</h4>
                <p style="margin: 0.5rem 0 0 0;">{content}</p>
            </div>
        </div>
    </div>
    """
    st.markdown(card_html, unsafe_allow_html=True)

def styled_container(content_function):
    """Decorator for adding styling to a content section"""
    def wrapper(*args, **kwargs):
        st.markdown('<div class="styled-container">', unsafe_allow_html=True)
        result = content_function(*args, **kwargs)
        st.markdown('</div>', unsafe_allow_html=True)
        return result
    return wrapper

def animate_on_hover():
    """Add animation effects on hover for various elements"""
    hover_css = """
    <style>
    /* Add hover animations to various components */
    .hover-grow {
        transition: all 0.3s ease;
    }
    
    .hover-grow:hover {
        transform: scale(1.05);
    }
    
    /* Apply these classes with st.markdown and HTML */
    </style>
    """
    st.markdown(hover_css, unsafe_allow_html=True)

def convert_avif_to_png(input_path, output_path):
    """Convert AVIF image to PNG"""
    try:
        from PIL import Image
        import io
        import base64
        
        # Try to convert using Pillow
        img = Image.open(input_path)
        img.save(output_path, "PNG")
        return True
    except Exception as e:
        st.error(f"Error converting image: {e}")
        return False

def display_badge(width=150):
    """Display the university badge with text underneath"""
    badge_html = f"""
    <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem;">
        <img src="assets/badge.png" width="{width}" style="margin-bottom: 0.7rem;">
        <h2 style="text-align: center; color: #3d2314; margin: 0 0 0.3rem 0; font-weight: bold; letter-spacing: 1px;">SOROTI UNIVERSITY</h2>
        <div style="height: 3px; width: 80px; background: linear-gradient(to right, #8B6030, #6f4e37); margin: 0.3rem 0;"></div>
        <p style="text-align: center; color: #6f4e37; margin: 0.2rem 0 0 0; font-style: italic; font-size: 1.1rem;">Smart Lab Resource Management System</p>
    </div>
    """
    st.markdown(badge_html, unsafe_allow_html=True)

def create_footer():
    """Create a styled footer for the application"""
    footer_html = """
    <div style="position: fixed; bottom: 0; left: 0; width: 100%; background-color: #3d2314; padding: 0.5rem 0; text-align: center; color: white; font-size: 0.8rem;">
        <p style="margin: 0;">© 2025 Smart Lab Resource Management System (S-Lab) - Soroti University | Developed with ❤️ for better resource management</p>
    </div>
    """
    st.markdown(footer_html, unsafe_allow_html=True)

def loading_animation():
    """Show a loading animation"""
    loading_html = """
    <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading...</p>
    </div>
    <style>
    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100px;
    }
    .spinner {
        border: 8px solid #f3f3f3;
        border-top: 8px solid #6f4e37;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    </style>
    """
    return st.markdown(loading_html, unsafe_allow_html=True)