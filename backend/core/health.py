from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connections
from django.db.utils import OperationalError
from redis import Redis
from redis.exceptions import RedisError

@api_view(['GET'])
def health_check(request):
    health = {
        'status': 'healthy',
        'database': check_database(),
        'cache': check_redis(),
    }
    return Response(health)

def check_database():
    try:
        connections['default'].cursor()
        return True
    except OperationalError:
        return False

def check_redis():
    try:
        redis_client = Redis.from_url(settings.REDIS_URL)
        return redis_client.ping()
    except RedisError:
        return False