from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import InventoryItem, StockMovement
from .serializers import InventoryItemSerializer, StockMovementSerializer
from apps.accounts.permissions import IsAdmin, IsStaff

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAdmin|IsStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'location']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'quantity', 'last_restocked']

    @action(detail=True, methods=['post'])
    def restock(self, request, pk=None):
        item = self.get_object()
        quantity = int(request.data.get('quantity', 0))
        
        if quantity <= 0:
            return Response(
                {'detail': 'Quantity must be positive'},
                status=status.HTTP_400_BAD_REQUEST
            )

        movement = StockMovement.objects.create(
            item=item,
            movement_type='in',
            quantity=quantity,
            performed_by=request.user,
            reference=request.data.get('reference', ''),
            notes=request.data.get('notes', '')
        )

        return Response(StockMovementSerializer(movement).data)

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAdmin|IsStaff]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['item', 'movement_type', 'performed_by']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)