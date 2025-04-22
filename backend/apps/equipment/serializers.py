from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Equipment, MaintenanceLog
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = ('id', 'name', 'description', 'serial_number', 'status', 'location',
                 'last_maintenance', 'next_maintenance', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class MaintenanceLogSerializer(serializers.ModelSerializer):
    technician = UserSerializer(read_only=True)
    technician_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='technician',
        write_only=True
    )

    class Meta:
        model = MaintenanceLog
        fields = '__all__'
        read_only_fields = ('created_at',)

class EquipmentDetailSerializer(EquipmentSerializer):
    maintenance_logs = MaintenanceLogSerializer(many=True, read_only=True)
    
    class Meta(EquipmentSerializer.Meta):
        fields = EquipmentSerializer.Meta.fields + ('maintenance_logs',) 