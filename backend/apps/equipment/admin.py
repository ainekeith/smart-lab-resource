from django.contrib import admin
from .models import Equipment, MaintenanceRecord

@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'serial_number', 'category', 'status', 'condition', 'location')
    list_filter = ('status', 'condition', 'category', 'location')
    search_fields = ('name', 'serial_number', 'model_number', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'image')
        }),
        ('Technical Details', {
            'fields': ('model_number', 'serial_number', 'manual_file')
        }),
        ('Status & Location', {
            'fields': ('status', 'condition', 'location')
        }),
        ('Dates', {
            'fields': ('purchase_date', 'last_maintained', 'next_maintenance')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_by', 'created_at', 'updated_at')
        }),
    )

@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = ('equipment', 'maintenance_type', 'maintenance_date', 'performed_by')
    list_filter = ('maintenance_type', 'maintenance_date', 'equipment')
    search_fields = ('equipment__name', 'description')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Maintenance Details', {
            'fields': ('equipment', 'maintenance_type', 'description')
        }),
        ('Service Information', {
            'fields': ('performed_by', 'maintenance_date', 'next_maintenance_date')
        }),
        ('Cost & Tracking', {
            'fields': ('cost', 'created_at')
        }),
    )
