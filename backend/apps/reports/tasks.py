from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum
from apps.bookings.models import Booking
from apps.inventory.models import InventoryItem, StockMovement
from apps.equipment.models import Equipment, MaintenanceLog

User = get_user_model()

@shared_task
def generate_daily_reports():
    """
    Generate daily reports and send them to staff users.
    """
    # Get yesterday's date
    yesterday = timezone.now().date() - timedelta(days=1)
    
    # Get booking statistics
    bookings = Booking.objects.filter(date=yesterday)
    total_bookings = bookings.count()
    approved_bookings = bookings.filter(status='approved').count()
    rejected_bookings = bookings.filter(status='rejected').count()
    pending_bookings = bookings.filter(status='pending').count()
    
    # Get inventory statistics
    total_items = InventoryItem.objects.count()
    low_stock_items = InventoryItem.objects.filter(quantity__lte=10).count()
    out_of_stock_items = InventoryItem.objects.filter(quantity=0).count()
    
    # Get equipment statistics
    total_equipment = Equipment.objects.count()
    maintenance_needed = Equipment.objects.filter(status='maintenance_needed').count()
    operational = Equipment.objects.filter(status='operational').count()
    
    # Prepare report
    report = {
        'date': yesterday,
        'bookings': {
            'total': total_bookings,
            'approved': approved_bookings,
            'rejected': rejected_bookings,
            'pending': pending_bookings
        },
        'inventory': {
            'total_items': total_items,
            'low_stock_items': low_stock_items,
            'out_of_stock_items': out_of_stock_items
        },
        'equipment': {
            'total_equipment': total_equipment,
            'maintenance_needed': maintenance_needed,
            'operational': operational
        }
    }
    
    # Get all staff users
    staff_users = User.objects.filter(is_staff=True)
    
    # Prepare email content
    subject = f'Daily Lab Report - {yesterday}'
    message = f'Daily Lab Report for {yesterday}\n\n'
    
    message += 'Bookings:\n'
    message += f'- Total: {total_bookings}\n'
    message += f'- Approved: {approved_bookings}\n'
    message += f'- Rejected: {rejected_bookings}\n'
    message += f'- Pending: {pending_bookings}\n\n'
    
    message += 'Inventory:\n'
    message += f'- Total Items: {total_items}\n'
    message += f'- Low Stock Items: {low_stock_items}\n'
    message += f'- Out of Stock Items: {out_of_stock_items}\n\n'
    
    message += 'Equipment:\n'
    message += f'- Total Equipment: {total_equipment}\n'
    message += f'- Maintenance Needed: {maintenance_needed}\n'
    message += f'- Operational: {operational}\n'
    
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
            title=f'Daily Lab Report - {yesterday}',
            message=f'Daily report for {yesterday} has been generated and sent to your email.',
            notification_type='daily_report'
        )
    
    return f"Generated daily report for {yesterday}"

@shared_task
def generate_weekly_report():
    """
    Generate a comprehensive weekly report.
    """
    # Get date range (last 7 days)
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=7)
    
    # Get booking statistics
    bookings = Booking.objects.filter(date__range=(start_date, end_date))
    total_bookings = bookings.count()
    approved_bookings = bookings.filter(status='approved').count()
    rejected_bookings = bookings.filter(status='rejected').count()
    pending_bookings = bookings.filter(status='pending').count()
    
    # Get booking trends by day
    booking_trends = bookings.values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    # Get inventory statistics
    total_items = InventoryItem.objects.count()
    low_stock_items = InventoryItem.objects.filter(quantity__lte=10).count()
    out_of_stock_items = InventoryItem.objects.filter(quantity=0).count()
    
    # Get movement statistics
    movements = StockMovement.objects.filter(timestamp__date__range=(start_date, end_date))
    total_movements = movements.count()
    in_movements = movements.filter(movement_type='in').count()
    out_movements = movements.filter(movement_type='out').count()
    
    # Get equipment statistics
    total_equipment = Equipment.objects.count()
    maintenance_needed = Equipment.objects.filter(status='maintenance_needed').count()
    operational = Equipment.objects.filter(status='operational').count()
    
    # Get maintenance logs
    maintenance_logs = MaintenanceLog.objects.filter(date__range=(start_date, end_date))
    total_maintenance = maintenance_logs.count()
    
    # Prepare report
    report = {
        'period': f"{start_date} to {end_date}",
        'bookings': {
            'total': total_bookings,
            'approved': approved_bookings,
            'rejected': rejected_bookings,
            'pending': pending_bookings,
            'trends': list(booking_trends)
        },
        'inventory': {
            'total_items': total_items,
            'low_stock_items': low_stock_items,
            'out_of_stock_items': out_of_stock_items,
            'total_movements': total_movements,
            'in_movements': in_movements,
            'out_movements': out_movements
        },
        'equipment': {
            'total_equipment': total_equipment,
            'maintenance_needed': maintenance_needed,
            'operational': operational,
            'total_maintenance': total_maintenance
        }
    }
    
    # Get all staff users
    staff_users = User.objects.filter(is_staff=True)
    
    # Prepare email content
    subject = f'Weekly Lab Report - {start_date} to {end_date}'
    message = f'Weekly Lab Report for {start_date} to {end_date}\n\n'
    
    message += 'Bookings:\n'
    message += f'- Total: {total_bookings}\n'
    message += f'- Approved: {approved_bookings}\n'
    message += f'- Rejected: {rejected_bookings}\n'
    message += f'- Pending: {pending_bookings}\n\n'
    
    message += 'Inventory:\n'
    message += f'- Total Items: {total_items}\n'
    message += f'- Low Stock Items: {low_stock_items}\n'
    message += f'- Out of Stock Items: {out_of_stock_items}\n'
    message += f'- Total Movements: {total_movements}\n'
    message += f'- In Movements: {in_movements}\n'
    message += f'- Out Movements: {out_movements}\n\n'
    
    message += 'Equipment:\n'
    message += f'- Total Equipment: {total_equipment}\n'
    message += f'- Maintenance Needed: {maintenance_needed}\n'
    message += f'- Operational: {operational}\n'
    message += f'- Total Maintenance: {total_maintenance}\n'
    
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
            title=f'Weekly Lab Report - {start_date} to {end_date}',
            message=f'Weekly report for {start_date} to {end_date} has been generated and sent to your email.',
            notification_type='weekly_report'
        )
    
    return f"Generated weekly report for {start_date} to {end_date}" 