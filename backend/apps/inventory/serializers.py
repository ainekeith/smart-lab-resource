from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import InventoryItem, StockMovement
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class InventoryItemSerializer(serializers.ModelSerializer):
    last_movement = serializers.SerializerMethodField()
    stock_status = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_last_movement(self, obj):
        last_movement = obj.movements.first()
        if last_movement:
            return {
                'type': last_movement.get_movement_type_display(),
                'quantity': last_movement.quantity,
                'date': last_movement.created_at
            }
        return None

    def get_stock_status(self, obj):
        if obj.quantity <= 0:
            return 'out_of_stock'
        if obj.quantity <= obj.minimum_quantity:
            return 'low_stock'
        return 'in_stock'

class StockMovementSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
        required=False
    )
    item = InventoryItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(),
        source='item',
        write_only=True
    )
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = StockMovement
        fields = '__all__'
        read_only_fields = ('timestamp', 'performed_by',)

    def validate(self, data):
        if data['movement_type'] == 'out' and data['item'].quantity < data['quantity']:
            raise serializers.ValidationError("Insufficient stock available")
        return data