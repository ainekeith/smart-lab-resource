from datetime import datetime, timedelta
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
import csv
import io
import json
from apps.equipment.models import Equipment, MaintenanceRecord
from apps.bookings.models import Booking
from apps.inventory.models import InventoryItem, StockMovement

class ReportGenerator:
    @staticmethod
    def generate_equipment_usage_report(start_date, end_date):
        bookings = Booking.objects.filter(
            created_at__range=[start_date, end_date]
        ).values('equipment__name').annotate(
            total_bookings=Count('id'),
            total_hours=Sum('duration'),
            avg_duration=Avg('duration')
        )

        maintenance = MaintenanceRecord.objects.filter(
            maintenance_date__range=[start_date, end_date]
        ).values('equipment__name').annotate(
            maintenance_count=Count('id')
        )

        return {
            'bookings': list(bookings),
            'maintenance': list(maintenance)
        }

    @staticmethod
    def generate_inventory_report():
        items = InventoryItem.objects.all().values(
            'name', 'sku', 'quantity', 'minimum_quantity'
        ).annotate(
            movements_count=Count('movements'),
            last_movement=Max('movements__created_at')
        )

        low_stock = items.filter(quantity__lte=F('minimum_quantity'))
        
        return {
            'inventory_status': list(items),
            'low_stock_items': list(low_stock)
        }

    @staticmethod
    def export_to_csv(data, filename):
        output = io.StringIO()
        writer = csv.writer(output)

        # Write headers
        headers = data[0].keys() if data else []
        writer.writerow(headers)

        # Write data
        for row in data:
            writer.writerow(row.values())

        return output.getvalue()