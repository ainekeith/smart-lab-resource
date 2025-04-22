from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('created_at',) 