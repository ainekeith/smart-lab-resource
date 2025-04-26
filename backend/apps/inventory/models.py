from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

class InventoryItem(models.Model):
    CATEGORY_CHOICES = [
        ('CHEMICALS', 'Chemicals'),
        ('GLASSWARE', 'Glassware'),
        ('EQUIPMENT', 'Equipment'),
        ('CONSUMABLES', 'Consumables'),
        ('OTHER', 'Other'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES,
        default='OTHER'
    )
    sku = models.CharField(max_length=50, unique=True)
    unit = models.CharField(max_length=50)  # e.g., pieces, liters, kg
    quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    minimum_quantity = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    location = models.CharField(max_length=255)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    last_restocked = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Inventory Item'
        verbose_name_plural = 'Inventory Items'

    def __str__(self):
        return f"{self.name} ({self.sku})"

class StockMovement(models.Model):
    MOVEMENT_TYPE_CHOICES = (
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
        ('adjust', 'Adjustment'),
    )

    item = models.ForeignKey(
        InventoryItem, 
        on_delete=models.CASCADE,
        related_name='movements'
    )
    movement_type = models.CharField(max_length=10, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.IntegerField()
    reference = models.CharField(max_length=255, blank=True)  # PO number, requisition number, etc.
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.movement_type == 'in':
            self.item.quantity += self.quantity
        elif self.movement_type == 'out':
            if self.item.quantity >= self.quantity:
                self.item.quantity -= self.quantity
            else:
                raise ValueError("Insufficient stock")
        elif self.movement_type == 'adjust':
            self.item.quantity = self.quantity
        
        self.item.save()
        super().save(*args, **kwargs)

@receiver(post_save, sender=InventoryItem)
def check_inventory_levels(sender, instance, **kwargs):
    from apps.notifications.models import Notification
    
    if instance.quantity <= instance.minimum_quantity:
        Notification.objects.create(
            title=f"Low Stock Alert: {instance.name}",
            message=f"Item {instance.name} (SKU: {instance.sku}) is running low. Current quantity: {instance.quantity}",
            notification_type='inventory_alert',
            related_object_id=instance.id
        )