from django.db import models
from django.conf import settings

class Report(models.Model):
    REPORT_TYPES = (
        ('equipment_usage', 'Equipment Usage'),
        ('maintenance', 'Maintenance Report'),
        ('inventory', 'Inventory Status'),
        ('booking_analytics', 'Booking Analytics'),
        ('user_activity', 'User Activity'),
    )

    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    description = models.TextField(blank=True)
    parameters = models.JSONField(default=dict)  # Store report parameters
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    file = models.FileField(upload_to='reports/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.report_type}"