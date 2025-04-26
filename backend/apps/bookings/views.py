from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.dateparse import parse_datetime
from django_filters import rest_framework as filters
from .models import Booking
from .serializers import BookingSerializer
from apps.accounts.permissions import IsAdmin, IsStaff, IsOwnerOrStaff

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
    serializer_class = BookingSerializer
    filterset_class = BookingFilter
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['admin', 'staff']:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
        
        return Response(BookingSerializer(booking).data)

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
        
        return Response(BookingSerializer(booking).data)

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
        
        return Response(BookingSerializer(booking).data)
