from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import InventoryItem, StockMovement

User = get_user_model()

@shared_task
def check_low_stock_items():
    """
    Check for items with low stock and send notifications to staff.
    """
    low_stock_items = InventoryItem.objects.filter(quantity__lte=10)
    
    if low_stock_items.exists():
        # Get all staff users
        staff_users = User.objects.filter(is_staff=True)
        
        # Prepare email content
        subject = 'Low Stock Alert'
        message = 'The following items are running low on stock:\n\n'
        
        for item in low_stock_items:
            message += f"- {item.name}: {item.quantity} remaining (min: {item.min_quantity})\n"
        
        message += '\nPlease take action to replenish these items.'
        
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
                title='Low Stock Alert',
                message=f'{low_stock_items.count()} items are running low on stock.',
                notification_type='inventory_alert'
            )
    
    return f"Checked {InventoryItem.objects.count()} items for low stock."

@shared_task
def record_stock_movement(item_id, quantity, movement_type, notes=None, user_id=None):
    """
    Record a stock movement and update the item quantity.
    """
    try:
        item = InventoryItem.objects.get(id=item_id)
        user = User.objects.get(id=user_id) if user_id else None
        
        # Create the stock movement
        movement = StockMovement.objects.create(
            item=item,
            quantity=quantity,
            movement_type=movement_type,
            notes=notes,
            user=user
        )
        
        # Update the item quantity
        if movement_type == 'in':
            item.quantity += quantity
        else:
            item.quantity -= quantity
        
        item.save()
        
        return f"Recorded {movement_type} movement of {quantity} units for {item.name}"
    
    except (InventoryItem.DoesNotExist, User.DoesNotExist) as e:
        return f"Error recording stock movement: {str(e)}"

@shared_task
def generate_inventory_report():
    """
    Generate a comprehensive inventory report.
    """
    from django.db.models import Sum, Count
    from django.utils import timezone
    from datetime import timedelta
    
    # Get date range (last 30 days)
    end_date = timezone.now()
    start_date = end_date - timedelta(days=30)
    
    # Get inventory statistics
    total_items = InventoryItem.objects.count()
    low_stock_items = InventoryItem.objects.filter(quantity__lte=10).count()
    out_of_stock_items = InventoryItem.objects.filter(quantity=0).count()
    
    # Get movement statistics
    movements = StockMovement.objects.filter(timestamp__range=(start_date, end_date))
    total_movements = movements.count()
    in_movements = movements.filter(movement_type='in').count()
    out_movements = movements.filter(movement_type='out').count()
    
    # Get top moved items
    top_moved_items = movements.values('item__name').annotate(
        total_quantity=Sum('quantity')
    ).order_by('-total_quantity')[:5]
    
    # Prepare report
    report = {
        'generated_at': timezone.now(),
        'period': f"{start_date.date()} to {end_date.date()}",
        'total_items': total_items,
        'low_stock_items': low_stock_items,
        'out_of_stock_items': out_of_stock_items,
        'total_movements': total_movements,
        'in_movements': in_movements,
        'out_movements': out_movements,
        'top_moved_items': list(top_moved_items)
    }
    
    # TODO: Save report to database or send via email
    
    return report 