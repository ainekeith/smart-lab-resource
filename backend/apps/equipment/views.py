from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Equipment, MaintenanceLog
from .serializers import EquipmentSerializer, MaintenanceLogSerializer, EquipmentDetailSerializer
from apps.accounts.permissions import IsStaffOrReadOnly, IsStaffOrOwner

# Create your views here.

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EquipmentDetailSerializer
        return EquipmentSerializer

    @action(detail=True, methods=['get'])
    def maintenance_history(self, request, pk=None):
        equipment = self.get_object()
        maintenance_logs = MaintenanceLog.objects.filter(equipment=equipment)
        serializer = MaintenanceLogSerializer(maintenance_logs, many=True)
        return Response(serializer.data)

class MaintenanceLogViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceLog.objects.all()
    serializer_class = MaintenanceLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrOwner]

    def perform_create(self, serializer):
        serializer.save(technician=self.request.user)
