from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Booking, LabSession
from apps.accounts.serializers import UserSerializer
from apps.equipment.serializers import EquipmentSerializer
from apps.equipment.models import Equipment

User = get_user_model()

class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    equipment = EquipmentSerializer(read_only=True)
    equipment_id = serializers.PrimaryKeyRelatedField(
        queryset=Equipment.objects.all(),
        source='equipment',
        write_only=True
    )
    approved_by = UserSerializer(read_only=True)
    approved_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='approved_by',
        write_only=True,
        required=False
    )
    equipment_details = EquipmentSerializer(source='equipment', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'status', 'approved_by', 'created_at', 'updated_at')

    def validate(self, data):
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        equipment = data.get('equipment')

        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError("End time must be after start time")
            
            if start_time < timezone.now():
                raise serializers.ValidationError("Cannot book in the past")

            # Check equipment availability
            conflicts = Booking.objects.filter(
                equipment=equipment,
                status='approved',
                start_time__lt=end_time,
                end_time__gt=start_time
            )
            
            if self.instance:
                conflicts = conflicts.exclude(pk=self.instance.pk)
            
            if conflicts.exists():
                raise serializers.ValidationError("Equipment is already booked for this time period")

        return data

class LabSessionSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    instructor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='instructor',
        write_only=True
    )
    equipment = EquipmentSerializer(many=True, read_only=True)
    equipment_ids = serializers.PrimaryKeyRelatedField(
        queryset=Equipment.objects.all(),
        source='equipment',
        write_only=True,
        many=True
    )

    class Meta:
        model = LabSession
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')