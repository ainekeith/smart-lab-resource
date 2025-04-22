from django.contrib import admin
from .models import Equipment, MaintenanceLog

@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'serial_number', 'status', 'location', 'last_maintenance')
    list_filter = ('status', 'location')
    search_fields = ('name', 'serial_number', 'description')
    ordering = ('name',)

@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ('equipment', 'technician', 'maintenance_date', 'next_maintenance_date')
    list_filter = ('maintenance_date', 'next_maintenance_date')
    search_fields = ('equipment__name', 'technician__username', 'description')
    ordering = ('-maintenance_date',)
