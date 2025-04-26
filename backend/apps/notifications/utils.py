from django.contrib.contenttypes.models import ContentType
from .models import Notification

def send_notification(user, title, message, notification_type='system', related_object=None):
    notification_data = {
        'user': user,
        'title': title,
        'message': message,
        'notification_type': notification_type,
    }

    if related_object:
        notification_data.update({
            'content_type': ContentType.objects.get_for_model(related_object),
            'object_id': related_object.id
        })

    return Notification.objects.create(**notification_data)

def send_bulk_notifications(users, title, message, notification_type='system', related_object=None):
    notifications = []
    for user in users:
        notification = send_notification(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            related_object=related_object
        )
        notifications.append(notification)
    return notifications