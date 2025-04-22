from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import InventoryItem, StockMovement
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

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

    class Meta:
        model = StockMovement
        fields = '__all__'
        read_only_fields = ('timestamp',) 