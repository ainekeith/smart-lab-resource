from django.contrib import admin
from .models import Booking, LabSession

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'equipment', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'start_time', 'end_time')
    search_fields = ('user__username', 'equipment__name', 'purpose')
    ordering = ('-start_time',)

@admin.register(LabSession)
class LabSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'start_time', 'end_time')
    search_fields = ('title', 'instructor__username', 'description')
    ordering = ('-start_time',)
    filter_horizontal = ('equipment',)
