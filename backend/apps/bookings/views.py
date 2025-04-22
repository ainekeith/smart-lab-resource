from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer
from apps.accounts.permissions import IsOwnerOrAdmin, IsStaffOrReadOnly

# Create your views here.

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        booking = self.get_object()
        if not request.user.is_staff:
            return Response(
                {"detail": "Only staff members can approve bookings."},
                status=status.HTTP_403_FORBIDDEN
            )
        booking.status = 'approved'
        booking.save()
        return Response({"status": "booking approved"})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        booking = self.get_object()
        if not request.user.is_staff:
            return Response(
                {"detail": "Only staff members can reject bookings."},
                status=status.HTTP_403_FORBIDDEN
            )
        booking.status = 'rejected'
        booking.save()
        return Response({"status": "booking rejected"})
