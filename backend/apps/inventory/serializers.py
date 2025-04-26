from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import InventoryItem, StockMovement
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class InventoryItemSerializer(serializers.ModelSerializer):
    last_movement = serializers.SerializerMethodField(read_only=True)
    stock_status = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'name', 'description', 'category', 'sku',
            'quantity', 'minimum_quantity', 'unit',
            'location', 'price_per_unit', 'created_at',
            'updated_at', 'last_movement', 'stock_status'
        ]
        read_only_fields = ('created_at', 'updated_at')

    def get_last_movement(self, obj):
        try:
            last_movement = obj.movements.first()
            if last_movement:
                return {
                    'type': last_movement.get_movement_type_display(),
                    'quantity': last_movement.quantity,
                    'date': last_movement.created_at
                }
        except Exception as e:
            return None
        return None

    def get_stock_status(self, obj):
        try:
            if obj.quantity <= 0:
                return 'out_of_stock'
            if obj.quantity <= obj.minimum_quantity:
                return 'low_stock'
            return 'in_stock'
        except Exception as e:
            return 'unknown'

    def to_representation(self, instance):
        try:
            return super().to_representation(instance)
        except Exception as e:
            # Fall back to basic representation if full serialization fails
            return {
                'id': instance.id,
                'name': instance.name,
                'category': instance.category,
                'quantity': instance.quantity,
                'minimum_quantity': instance.minimum_quantity
            }

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