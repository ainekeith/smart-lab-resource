from django.utils.dateparse import parse_datetime
from rest_framework.response import Response
from rest_framework import status

class BookingDateParserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/bookings/') and request.method == 'POST':
            try:
                if 'start_time' in request.data:
                    request.data['start_time'] = parse_datetime(request.data['start_time'])
                if 'end_time' in request.data:
                    request.data['end_time'] = parse_datetime(request.data['end_time'])
            except (ValueError, TypeError) as e:
                return Response(
                    {'detail': 'Invalid date format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return self.get_response(request)