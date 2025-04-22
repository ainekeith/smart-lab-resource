from django.contrib import admin
from .models import EquipmentUsage, LabUtilization

@admin.register(EquipmentUsage)
class EquipmentUsageAdmin(admin.ModelAdmin):
    list_display = ('equipment', 'date', 'total_hours_used', 'total_bookings', 'maintenance_hours')
    list_filter = ('date', 'equipment')
    search_fields = ('equipment__name',)
    ordering = ('-date',)

@admin.register(LabUtilization)
class LabUtilizationAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_sessions', 'total_hours', 'equipment_utilization_rate')
    list_filter = ('date',)
    ordering = ('-date',)
