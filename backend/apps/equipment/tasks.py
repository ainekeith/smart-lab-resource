from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import Equipment, MaintenanceLog

User = get_user_model()

@shared_task
def check_equipment_maintenance():
    """
    Check for equipment that needs maintenance and send notifications.
    """
    # Get equipment that needs maintenance
    equipment_needing_maintenance = Equipment.objects.filter(
        status='maintenance_needed'
    )
    
    # Get equipment with upcoming maintenance
    today = timezone.now().date()
    upcoming_maintenance = Equipment.objects.filter(
        next_maintenance_date__lte=today + timedelta(days=7)
    ).exclude(status='maintenance_needed')
    
    if equipment_needing_maintenance.exists() or upcoming_maintenance.exists():
        # Get all staff users
        staff_users = User.objects.filter(is_staff=True)
        
        # Prepare email content
        subject = 'Equipment Maintenance Alert'
        message = 'Equipment Maintenance Status:\n\n'
        
        if equipment_needing_maintenance.exists():
            message += 'Equipment needing immediate maintenance:\n'
            for equipment in equipment_needing_maintenance:
                message += f"- {equipment.name}: {equipment.description}\n"
        
        if upcoming_maintenance.exists():
            message += '\nEquipment with upcoming maintenance:\n'
            for equipment in upcoming_maintenance:
                message += f"- {equipment.name}: Due on {equipment.next_maintenance_date}\n"
        
        # Send email to all staff users
        for user in staff_users:
            if user.email:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
        
        # Create notifications for staff users
        from apps.notifications.models import Notification
        
        for user in staff_users:
            if equipment_needing_maintenance.exists():
                Notification.objects.create(
                    user=user,
                    title='Equipment Maintenance Required',
                    message=f'{equipment_needing_maintenance.count()} equipment items need immediate maintenance.',
                    notification_type='maintenance_alert'
                )
            
            if upcoming_maintenance.exists():
                Notification.objects.create(
                    user=user,
                    title='Upcoming Equipment Maintenance',
                    message=f'{upcoming_maintenance.count()} equipment items have upcoming maintenance.',
                    notification_type='maintenance_reminder'
                )
    
    return f"Checked {Equipment.objects.count()} equipment items for maintenance."

@shared_task
def schedule_maintenance_reminder(equipment_id, days_before=3):
    """
    Schedule a maintenance reminder for a specific equipment.
    """
    try:
        equipment = Equipment.objects.get(id=equipment_id)
        
        # Calculate reminder date
        reminder_date = equipment.next_maintenance_date - timedelta(days=days_before)
        
        # Schedule the reminder task
        from celery import current_app
        current_app.send_task(
            'apps.equipment.tasks.send_maintenance_reminder',
            args=[equipment_id],
            eta=reminder_date
        )
        
        return f"Scheduled maintenance reminder for {equipment.name} on {reminder_date}"
    
    except Equipment.DoesNotExist:
        return f"Error scheduling maintenance reminder: Equipment with ID {equipment_id} not found"

@shared_task
def send_maintenance_reminder(equipment_id):
    """
    Send a maintenance reminder for a specific equipment.
    """
    try:
        equipment = Equipment.objects.get(id=equipment_id)
        
        # Get all staff users
        staff_users = User.objects.filter(is_staff=True)
        
        # Prepare email content
        subject = f'Maintenance Reminder: {equipment.name}'
        message = f'This is a reminder that {equipment.name} is scheduled for maintenance on {equipment.next_maintenance_date}.\n\n'
        message += f'Equipment Details:\n'
        message += f'- Name: {equipment.name}\n'
        message += f'- Description: {equipment.description}\n'
        message += f'- Location: {equipment.location}\n'
        message += f'- Maintenance Date: {equipment.next_maintenance_date}\n'
        
        # Send email to all staff users
        for user in staff_users:
            if user.email:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
        
        # Create notifications for staff users
        from apps.notifications.models import Notification
        
        for user in staff_users:
            Notification.objects.create(
                user=user,
                title=f'Maintenance Reminder: {equipment.name}',
                message=f'{equipment.name} is scheduled for maintenance on {equipment.next_maintenance_date}.',
                notification_type='maintenance_reminder'
            )
        
        return f"Sent maintenance reminder for {equipment.name}"
    
    except Equipment.DoesNotExist:
        return f"Error sending maintenance reminder: Equipment with ID {equipment_id} not found" 