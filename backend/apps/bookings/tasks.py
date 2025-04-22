from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import Booking

User = get_user_model()

@shared_task
def send_booking_reminders():
    """
    Send reminders for upcoming bookings.
    """
    # Get bookings happening tomorrow
    tomorrow = timezone.now().date() + timedelta(days=1)
    upcoming_bookings = Booking.objects.filter(
        date=tomorrow,
        status='approved'
    )
    
    if upcoming_bookings.exists():
        for booking in upcoming_bookings:
            # Send email to the user
            if booking.user.email:
                subject = f'Reminder: Your Booking Tomorrow - {booking.equipment.name}'
                message = f'This is a reminder that you have a booking tomorrow:\n\n'
                message += f'- Equipment: {booking.equipment.name}\n'
                message += f'- Date: {booking.date}\n'
                message += f'- Time: {booking.start_time} to {booking.end_time}\n'
                message += f'- Purpose: {booking.purpose}\n\n'
                message += f'Please arrive on time and bring any necessary materials.'
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [booking.user.email],
                    fail_silently=False,
                )
            
            # Create notification for the user
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=booking.user,
                title=f'Booking Reminder: {booking.equipment.name}',
                message=f'Your booking for {booking.equipment.name} is tomorrow at {booking.start_time}.',
                notification_type='booking_reminder'
            )
    
    return f"Sent reminders for {upcoming_bookings.count()} bookings."

@shared_task
def send_booking_confirmation(booking_id):
    """
    Send a confirmation email for a newly approved booking.
    """
    try:
        booking = Booking.objects.get(id=booking_id)
        
        if booking.user.email:
            subject = f'Booking Confirmed: {booking.equipment.name}'
            message = f'Your booking has been approved:\n\n'
            message += f'- Equipment: {booking.equipment.name}\n'
            message += f'- Date: {booking.date}\n'
            message += f'- Time: {booking.start_time} to {booking.end_time}\n'
            message += f'- Purpose: {booking.purpose}\n\n'
            message += f'Please arrive on time and bring any necessary materials.'
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [booking.user.email],
                fail_silently=False,
            )
        
        # Create notification for the user
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=booking.user,
            title=f'Booking Confirmed: {booking.equipment.name}',
            message=f'Your booking for {booking.equipment.name} on {booking.date} has been approved.',
            notification_type='booking_confirmation'
        )
        
        return f"Sent confirmation for booking {booking_id}"
    
    except Booking.DoesNotExist:
        return f"Error sending booking confirmation: Booking with ID {booking_id} not found"

@shared_task
def send_booking_rejection(booking_id, rejection_reason=None):
    """
    Send a rejection notification for a booking.
    """
    try:
        booking = Booking.objects.get(id=booking_id)
        
        if booking.user.email:
            subject = f'Booking Rejected: {booking.equipment.name}'
            message = f'Your booking has been rejected:\n\n'
            message += f'- Equipment: {booking.equipment.name}\n'
            message += f'- Date: {booking.date}\n'
            message += f'- Time: {booking.start_time} to {booking.end_time}\n'
            message += f'- Purpose: {booking.purpose}\n\n'
            
            if rejection_reason:
                message += f'Reason: {rejection_reason}\n\n'
            
            message += f'Please contact the lab administrator if you have any questions.'
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [booking.user.email],
                fail_silently=False,
            )
        
        # Create notification for the user
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=booking.user,
            title=f'Booking Rejected: {booking.equipment.name}',
            message=f'Your booking for {booking.equipment.name} on {booking.date} has been rejected.',
            notification_type='booking_rejection'
        )
        
        return f"Sent rejection notification for booking {booking_id}"
    
    except Booking.DoesNotExist:
        return f"Error sending booking rejection: Booking with ID {booking_id} not found" 