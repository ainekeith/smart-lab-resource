from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from apps.bookings.models import Booking
from apps.inventory.models import InventoryItem, StockMovement
from apps.equipment.models import Equipment, MaintenanceLog
from apps.accounts.permissions import IsAdminUser

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    @action(detail=False, methods=['get'])
    def booking_statistics(self, request):
        # Get date range from query params or default to last 30 days
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        bookings = Booking.objects.filter(created_at__gte=start_date)
        
        stats = {
            'total_bookings': bookings.count(),
            'approved_bookings': bookings.filter(status='approved').count(),
            'rejected_bookings': bookings.filter(status='rejected').count(),
            'pending_bookings': bookings.filter(status='pending').count(),
            'bookings_by_status': list(bookings.values('status').annotate(count=Count('id')))
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def inventory_statistics(self, request):
        stats = {
            'total_items': InventoryItem.objects.count(),
            'low_stock_items': InventoryItem.objects.filter(quantity__lte=10).count(),
            'out_of_stock_items': InventoryItem.objects.filter(quantity=0).count(),
            'recent_movements': StockMovement.objects.order_by('-timestamp')[:10].values()
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def equipment_statistics(self, request):
        stats = {
            'total_equipment': Equipment.objects.count(),
            'maintenance_needed': Equipment.objects.filter(status='maintenance_needed').count(),
            'operational': Equipment.objects.filter(status='operational').count(),
            'recent_maintenance': MaintenanceLog.objects.order_by('-date')[:10].values()
        }
        return Response(stats) 