from rest_framework import serializers
from .models import EquipmentUsage, LabUtilization
from apps.equipment.serializers import EquipmentSerializer

class EquipmentUsageSerializer(serializers.ModelSerializer):
    equipment = EquipmentSerializer(read_only=True)
    equipment_id = serializers.PrimaryKeyRelatedField(
        queryset=Equipment.objects.all(),
        source='equipment',
        write_only=True
    )

    class Meta:
        model = EquipmentUsage
        fields = '__all__'

class LabUtilizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabUtilization
        fields = '__all__' 