from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Booking, LabSession
from apps.accounts.serializers import UserSerializer
from apps.equipment.serializers import EquipmentSerializer
from apps.equipment.models import Equipment
import logging

logger = logging.getLogger(__name__)

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

from django.core.exceptions import ObjectDoesNotExist

class BookingCreateSerializer(serializers.ModelSerializer):
    equipment_id = serializers.PrimaryKeyRelatedField(
        queryset=Equipment.objects.all(),
        source='equipment'
    )

    class Meta:
        model = Booking
        fields = ['equipment_id', 'start_time', 'end_time', 'purpose']

    def validate(self, data):
        try:
            # Get the equipment instance
            equipment = data.get('equipment')
            if not equipment:
                raise serializers.ValidationError({
                    'equipment_id': 'Equipment is required'
                })

            # Validate dates
            start_time = data.get('start_time')
            end_time = data.get('end_time')

            if not start_time or not end_time:
                raise serializers.ValidationError({
                    'non_field_errors': 'Both start and end times are required'
                })

            # Convert to timezone-aware if they aren't already
            if timezone.is_naive(start_time):
                start_time = timezone.make_aware(start_time)
            if timezone.is_naive(end_time):
                end_time = timezone.make_aware(end_time)

            # Validate time order
            if start_time >= end_time:
                raise serializers.ValidationError({
                    'end_time': 'End time must be after start time'
                })

            # Check if booking is in the past
            now = timezone.now()
            if start_time < now:
                raise serializers.ValidationError({
                    'start_time': 'Cannot create bookings in the past'
                })

            # Check for overlapping bookings
            overlapping = Booking.objects.filter(
                equipment=equipment,
                status='approved',
                start_time__lt=end_time,
                end_time__gt=start_time
            ).exists()

            if overlapping:
                raise serializers.ValidationError({
                    'non_field_errors': 'Equipment is already booked for this time period'
                })

            # Update the data with timezone-aware datetimes
            data['start_time'] = start_time
            data['end_time'] = end_time

            return data

        except serializers.ValidationError:
            raise
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Validation error: {str(e)}")
            raise serializers.ValidationError('An error occurred during validation')

class BookingDetailSerializer(serializers.ModelSerializer):
    """Serializer for reading booking details - includes related data"""
    user = UserSerializer(read_only=True)
    equipment = EquipmentSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'equipment',
            'equipment_id',
            'start_time',
            'end_time',
            'purpose',
            'status',
            'approved_by',
            'rejection_reason',
            'created_at'
        ]