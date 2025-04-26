from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.bookings.models import Booking
from apps.equipment.models import MaintenanceRecord
from .utils import send_notification

@receiver(post_save, sender=Booking)
def booking_notification(sender, instance, created, **kwargs):
    if created:
        # Notify staff about new booking
        staff_users = User.objects.filter(user_type__in=['admin', 'staff'])
        for user in staff_users:
            send_notification(
                user=user,
                title='New Booking Request',
                message=f'New booking request for {instance.equipment.name}',
                notification_type='booking',
                related_object=instance
            )
    elif instance.status in ['approved', 'rejected']:
        # Notify user about booking status change
        send_notification(
            user=instance.user,
            title=f'Booking {instance.status.title()}',
            message=f'Your booking for {instance.equipment.name} has been {instance.status}',
            notification_type='booking',
            related_object=instance
        )