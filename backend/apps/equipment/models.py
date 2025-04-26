from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Equipment(models.Model):
    CONDITION_CHOICES = (
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('maintenance', 'Under Maintenance'),
    )

    STATUS_CHOICES = (
        ('available', 'Available'),
        ('in_use', 'In Use'),
        ('reserved', 'Reserved'),
        ('maintenance', 'Under Maintenance'),
        ('out_of_service', 'Out of Service'),
    )

    name = models.CharField(max_length=255)
    description = models.TextField()
    model_number = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    purchase_date = models.DateField()
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    last_maintained = models.DateField(null=True, blank=True)
    next_maintenance = models.DateField(null=True, blank=True)
    image = models.ImageField(upload_to='equipment/', null=True, blank=True)
    manual_file = models.FileField(upload_to='manuals/', null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='equipment_created'
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Equipment'
        verbose_name_plural = 'Equipment'

    def __str__(self):
        return f"{self.name} - {self.serial_number}"

    def clean(self):
        if self.next_maintenance and self.next_maintenance < self.last_maintained:
            raise ValidationError("Next maintenance date must be after last maintenance date")

class MaintenanceRecord(models.Model):
    MAINTENANCE_TYPE_CHOICES = (
        ('routine', 'Routine Maintenance'),
        ('repair', 'Repair'),
        ('inspection', 'Inspection'),
        ('calibration', 'Calibration'),
    )

    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='maintenance_records')
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_TYPE_CHOICES)
    description = models.TextField()
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    maintenance_date = models.DateField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    next_maintenance_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-maintenance_date']
        verbose_name = 'Maintenance Record'
        verbose_name_plural = 'Maintenance Records'

    def __str__(self):
        return f"{self.equipment.name} - {self.maintenance_type} - {self.maintenance_date}"
