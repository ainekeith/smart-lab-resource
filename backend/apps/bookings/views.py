from django.shortcuts import render
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.dateparse import parse_datetime
from django_filters import rest_framework as filters
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer, BookingDetailSerializer
from apps.accounts.permissions import IsAdmin, IsStaff, IsOwnerOrStaff
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)

class BookingFilter(filters.FilterSet):
    start_date = filters.DateTimeFilter(field_name='start_time', lookup_expr='gte')
    end_date = filters.DateTimeFilter(field_name='end_time', lookup_expr='lte')
    
    class Meta:
        model = Booking
        fields = {
            'status': ['exact'],
            'equipment': ['exact'],
            'user': ['exact'],
        }

class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = BookingFilter

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['admin', 'staff']:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        try:
            logger.debug(f"Creating booking with data: {request.data}")
            
            # Validate required fields
            required_fields = ['equipment_id', 'start_time', 'end_time', 'purpose']
            missing_fields = [field for field in required_fields if field not in request.data]
            if missing_fields:
                return Response(
                    {'detail': f'Missing required fields: {", ".join(missing_fields)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = self.get_serializer(data=request.data)
            
            try:
                serializer.is_valid(raise_exception=True)
            except serializers.ValidationError as e:
                logger.error(f"Validation error: {str(e)}")
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

            # Create the booking
            booking = serializer.save(
                user=request.user,
                status='pending'
            )

            # Return complete booking data with request context
            detail_serializer = BookingDetailSerializer(
                booking,
                context={'request': request}  # Add request to context
            )
            return Response(
                detail_serializer.data,
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            logger.error(f"Unexpected error creating booking: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {'detail': 'An error occurred while creating the booking'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.user_type not in ['admin', 'staff']:
            return Response(
                {'detail': 'Only staff can approve bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking = self.get_object()
        booking.status = 'approved'
        booking.approved_by = request.user
        booking.save()
        
        return Response(BookingDetailSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.user_type not in ['admin', 'staff']:
            return Response(
                {'detail': 'Only staff can reject bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking = self.get_object()
        booking.status = 'rejected'
        booking.rejection_reason = request.data.get('reason', '')
        booking.approved_by = request.user
        booking.save()
        
        return Response(BookingDetailSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        
        if booking.user != request.user and request.user.user_type not in ['admin', 'staff']:
            return Response(
                {'detail': 'You can only cancel your own bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking.status = 'cancelled'
        booking.save()
        
        return Response(BookingDetailSerializer(booking).data)
