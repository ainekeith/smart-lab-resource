from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters as rest_filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Equipment, MaintenanceRecord
from .serializers import EquipmentSerializer, MaintenanceRecordSerializer, EquipmentDetailSerializer
from apps.accounts.permissions import IsAdmin, IsStaff, IsOwnerOrStaff
from django_filters import rest_framework as django_filters
from django_filters.rest_framework import DjangoFilterBackend
import logging

logger = logging.getLogger(__name__)

class EquipmentFilter(django_filters.FilterSet):
    class Meta:
        model = Equipment
        fields = {
            'name': ['icontains'],
            'category': ['exact'],
            'status': ['exact'],
            'condition': ['exact'],
            'location': ['exact'],
        }

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsOwnerOrStaff]
    filter_backends = [
        django_filters.DjangoFilterBackend,
        rest_filters.SearchFilter,
        rest_filters.OrderingFilter
    ]
    filterset_class = EquipmentFilter
    search_fields = ['name', 'description', 'model_number', 'serial_number']
    ordering_fields = ['name', 'created_at', 'status', 'condition']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EquipmentDetailSerializer
        return EquipmentSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def add_maintenance(self, request, pk=None):
        equipment = self.get_object()
        serializer = MaintenanceRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(equipment=equipment, performed_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def maintenance_history(self, request, pk=None):
        equipment = self.get_object()
        records = equipment.maintenance_records.all().order_by('-maintenance_date')
        serializer = MaintenanceRecordSerializer(records, many=True)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        logger.debug(f"User {request.user.username} requesting equipment list")
        queryset = self.filter_queryset(self.get_queryset())
        logger.debug(f"Found {queryset.count()} equipment items")
        
        return super().list(request, *args, **kwargs)

class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.all()
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [IsAdmin|IsStaff]

    def get_queryset(self):
        return MaintenanceRecord.objects.filter(equipment_id=self.kwargs['equipment_pk'])
