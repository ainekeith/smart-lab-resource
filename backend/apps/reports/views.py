from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Report
from .serializers import ReportSerializer
from .services import ReportGenerator
from apps.accounts.permissions import IsAdmin, IsStaff
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncDate

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAdmin|IsStaff]

    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)

    @action(detail=False, methods=['get'])
    def equipment_usage(self, request):
        start_date = request.query_params.get('start_date', 
            (timezone.now() - timedelta(days=30)).isoformat())
        end_date = request.query_params.get('end_date', timezone.now().isoformat())
        
        data = ReportGenerator.generate_equipment_usage_report(start_date, end_date)
        
        report = Report.objects.create(
            title=f"Equipment Usage Report ({start_date} to {end_date})",
            report_type='equipment_usage',
            parameters={'start_date': start_date, 'end_date': end_date},
            generated_by=request.user
        )
        
        return Response({
            'report': ReportSerializer(report).data,
            'data': data
        })

    @action(detail=False, methods=['get'])
    def inventory_status(self, request):
        data = ReportGenerator.generate_inventory_report()
        
        report = Report.objects.create(
            title=f"Inventory Status Report {timezone.now().date()}",
            report_type='inventory',
            generated_by=request.user
        )
        
        return Response({
            'report': ReportSerializer(report).data,
            'data': data
        })

    @action(detail=True, methods=['get'])
    def download_csv(self, request, pk=None):
        report = self.get_object()
        if report.report_type == 'equipment_usage':
            data = ReportGenerator.generate_equipment_usage_report(
                **report.parameters
            )
        elif report.report_type == 'inventory':
            data = ReportGenerator.generate_inventory_report()
        
        csv_content = ReportGenerator.export_to_csv(data)
        
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{report.title}.csv"'
        return response

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        today = timezone.now()
        thirty_days_ago = today - timedelta(days=30)
        
        return Response({
            'equipment_stats': {
                'total': Equipment.objects.count(),
                'available': Equipment.objects.filter(status='available').count(),
                'under_maintenance': Equipment.objects.filter(status='maintenance').count(),
            },
            'booking_stats': {
                'pending': Booking.objects.filter(status='pending').count(),
                'active': Booking.objects.filter(status='approved').count(),
                'monthly_usage': Booking.objects.filter(
                    created_at__gte=thirty_days_ago
                ).count(),
            },
            'inventory_stats': {
                'low_stock': InventoryItem.objects.filter(
                    quantity__lte=F('minimum_quantity')
                ).count(),
                'total_items': InventoryItem.objects.count(),
            },
            'maintenance_stats': {
                'scheduled': MaintenanceRecord.objects.filter(
                    maintenance_date__gte=today
                ).count(),
                'completed': MaintenanceRecord.objects.filter(
                    maintenance_date__lte=today
                ).count(),
            }
        })