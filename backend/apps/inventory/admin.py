from django.contrib import admin
from .models import InventoryItem

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'category',
        'sku',
        'quantity',
        'minimum_quantity',
        'unit',
        'location',
        'price_per_unit',
    ]
    list_filter = ['category', 'location']
    search_fields = ['name', 'sku', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = [
        ('Basic Information', {
            'fields': [
                'name',
                'description',
                'category',
                'sku',
                'location',
            ]
        }),
        ('Stock Details', {
            'fields': [
                'quantity',
                'minimum_quantity',
                'unit',
                'price_per_unit',
            ]
        }),
        ('Metadata', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse']
        })
    ]

    def save_model(self, request, obj, form, change):
        if not change:  # If creating new item
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)