from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Equipment, MaintenanceRecord
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class MaintenanceRecordSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.ReadOnlyField(source='performed_by.get_full_name')

    class Meta:
        model = MaintenanceRecord
        fields = '__all__'
        read_only_fields = ('created_at',)

class EquipmentSerializer(serializers.ModelSerializer):
    maintenance_records = serializers.SerializerMethodField()
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    image_url = serializers.SerializerMethodField()
    manual_url = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = (
            'id', 'name', 'description', 'model_number', 'serial_number',
            'category', 'location', 'condition', 'status', 'purchase_date',
            'last_maintained', 'next_maintenance', 'image', 'manual_file',
            'notes', 'created_by', 'created_by_name', 'status_display',
            'condition_display', 'image_url', 'manual_url', 'maintenance_records',
            'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at', 'created_by')

    def get_maintenance_records(self, obj):
        records = obj.maintenance_records.all()[:5]
        return MaintenanceRecordSerializer(records, many=True).data

    def get_image_url(self, obj):
        if (obj.image):
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

    def get_manual_url(self, obj):
        if (obj.manual_file):
            return self.context['request'].build_absolute_uri(obj.manual_file.url)
        return None

    def validate(self, data):
        if data.get('next_maintenance') and data.get('last_maintained'):
            if data['next_maintenance'] < data['last_maintained']:
                raise serializers.ValidationError(
                    "Next maintenance date must be after last maintenance date"
                )
        return data

class EquipmentDetailSerializer(EquipmentSerializer):
    maintenance_records = MaintenanceRecordSerializer(many=True, read_only=True)
    
    class Meta(EquipmentSerializer.Meta):
        model = Equipment
        fields = EquipmentSerializer.Meta.fields



