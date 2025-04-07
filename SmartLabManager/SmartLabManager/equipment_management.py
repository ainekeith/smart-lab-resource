import streamlit as st
import pandas as pd
import database

def show_equipment_management():
    st.image("assets/badge.png", width=150)
    st.title("Equipment Management")
    
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
            equipment = database.get_equipment(equipment_id)
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
                                database.update_equipment_status(equipment_id, new_status)
                                st.success(f"Status updated to {new_status}")
                                st.rerun()
                        else:
                            database.update_equipment_status(equipment_id, new_status)
                            st.success(f"Status updated to {new_status}")
                            st.rerun()
                
                # Delete equipment button
                if st.button("Delete Equipment", type="primary", help="This will permanently remove the equipment"):
                    success, message = database.delete_equipment(equipment_id)
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
                    new_equipment = database.add_equipment(
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
            equipment = database.get_equipment(edit_id)
            
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
                            
                            database.update_equipment(edit_id, updated_data)
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