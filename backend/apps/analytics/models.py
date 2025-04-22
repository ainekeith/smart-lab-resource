from django.db import models
from django.conf import settings
from apps.equipment.models import Equipment

class EquipmentUsage(models.Model):
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    date = models.DateField()
    total_hours_used = models.DecimalField(max_digits=5, decimal_places=2)
    total_bookings = models.IntegerField()
    maintenance_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    class Meta:
        unique_together = ['equipment', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"Usage stats for {self.equipment.name} on {self.date}"

class LabUtilization(models.Model):
    date = models.DateField()
    total_sessions = models.IntegerField()
    total_hours = models.DecimalField(max_digits=5, decimal_places=2)
    equipment_utilization_rate = models.DecimalField(max_digits=5, decimal_places=2)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Lab utilization stats for {self.date}"
