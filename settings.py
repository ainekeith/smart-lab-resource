import streamlit as st

def show_settings():
    st.image("assets/badge.png", width=150)
    st.title("Settings")
    
    # Theme settings
    st.subheader("Appearance")
    
    theme = st.radio(
        "Theme Mode",
        options=["Light", "Dark"],
        index=0 if st.session_state.theme == "light" else 1,
        horizontal=True
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
        from email_validator import validate_email, EmailNotValidError
        
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
