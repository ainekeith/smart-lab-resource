from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import InventoryItem, StockMovement
from .serializers import InventoryItemSerializer, StockMovementSerializer
from apps.accounts.permissions import IsStaffOrReadOnly

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = InventoryItem.objects.all()
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    @action(detail=True, methods=['get'])
    def stock_history(self, request, pk=None):
        item = self.get_object()
        movements = StockMovement.objects.filter(item=item).order_by('-timestamp')
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = StockMovement.objects.all()
        item_id = self.request.query_params.get('item', None)
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        return queryset

    def perform_create(self, serializer):
        movement = serializer.save()
        item = movement.item
        if movement.movement_type == 'in':
            item.quantity += movement.quantity
        else:
            item.quantity -= movement.quantity
        item.save() 