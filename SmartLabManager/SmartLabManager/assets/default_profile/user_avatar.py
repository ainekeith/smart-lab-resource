import io
import random
import base64
from PIL import Image, ImageDraw, ImageFont, ImageColor

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
    # Ensure initials are uppercase and limited to 2 characters
    initials = initials.upper()[:2]
    
    # Create a random background color if none provided
    if background_color is None:
        # Colors with good contrast for text (browns and complementary colors)
        colors = [
            "#6E432C",  # Dark coffee brown (primary)
            "#845A40",  # Medium coffee brown
            "#A77B5B",  # Light coffee brown
            "#C29E7F",  # Very light coffee brown
            "#3E474F",  # Deep slate (secondary)
            "#4D5A64",  # Medium slate
            "#1E90FF",  # Bright blue
            "#2E8B57",  # Sea green
            "#B22222",  # Firebrick red
            "#F0A500",  # Golden yellow
        ]
        background_color = random.choice(colors)
    
    # Create a square image with the specified background color
    img = Image.new('RGB', size, color=background_color)
    draw = ImageDraw.Draw(img)
    
    # Calculate font size (approximately 40% of the image width)
    font_size = int(size[0] * 0.4)
    
    try:
        # Try to use a system font
        font = ImageFont.truetype("Arial", font_size)
    except IOError:
        # Fallback to default font
        font = ImageFont.load_default()
    
    # Calculate text position to center it
    try:
        # For newer versions of Pillow
        text_size = font.getbbox(initials)
        text_width, text_height = text_size[2] - text_size[0], text_size[3] - text_size[1]
    except AttributeError:
        # Emergency fallback with approximation - all modern Pillow versions should support getbbox
        text_width, text_height = font_size, font_size
    
    position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2 - font_size // 3)
    
    # Draw the text in white for good contrast
    draw.text(position, initials, fill="white", font=font)
    
    # Add a subtle pattern or gradient effect
    for i in range(0, size[0], 10):
        draw.line([(i, 0), (i, size[1])], fill=(255, 255, 255, 10), width=1)
    
    # Add a subtle border
    border_width = 5
    border_color = "white"
    draw.rectangle(
        (0, 0, size[0] - 1, size[1] - 1),
        outline=border_color,
        width=border_width
    )
    
    return img

def get_default_avatar(name="User"):
    """
    Generate a default avatar based on the user's name
    
    Args:
        name (str): User's name
    
    Returns:
        str: Base64 encoded avatar image
    """
    # Generate initials from name
    if name and len(name) > 0:
        parts = name.split()
        if len(parts) > 1:
            initials = parts[0][0] + parts[-1][0]
        else:
            initials = name[0]
    else:
        initials = "U"
    
    # Generate the avatar image
    avatar = generate_avatar(initials)
    
    # Convert the image to base64 for embedding in HTML/CSS
    buffered = io.BytesIO()
    avatar.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"