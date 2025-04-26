from celery import shared_task
from django.utils import timezone
from apps.equipment.models import Equipment
from apps.notifications.utils import send_notification
from apps.inventory.models import InventoryItem

@shared_task
def check_maintenance_schedule():
    upcoming = Equipment.objects.filter(
        next_maintenance__lte=timezone.now() + timedelta(days=7)
    )
    
    for equipment in upcoming:
        send_notification(
            equipment.created_by,
            'Maintenance Due',
            f'Maintenance is due for {equipment.name}'
        )

@shared_task
def check_inventory_levels():
    low_stock = InventoryItem.objects.filter(
        quantity__lte=F('minimum_quantity')
    )
    
    for item in low_stock:
        send_notification(
            None,
            'Low Stock Alert',
            f'Item {item.name} is running low'
        )