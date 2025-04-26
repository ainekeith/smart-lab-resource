from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.related_object:
            data['related_object'] = {
                'type': instance.content_type.model,
                'id': instance.object_id,
                'str': str(instance.related_object)
            }
        return data