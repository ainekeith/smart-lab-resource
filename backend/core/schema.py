from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from django.conf import settings

schema_view = get_schema_view(
    openapi.Info(
        title="Smart Lab Resource API",
        default_version='v1',
        description="API documentation for Smart Lab Resource Management System",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@smartlab.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# Custom schema decorators for common responses
def common_responses():
    return {
        400: openapi.Response('Bad Request'),
        401: openapi.Response('Unauthorized'),
        403: openapi.Response('Forbidden'),
        404: openapi.Response('Not Found'),
        500: openapi.Response('Internal Server Error'),
    }

def list_schema(**kwargs):
    return swagger_auto_schema(
        operation_description="List all items",
        responses={
            200: openapi.Response('Success'),
            **common_responses()
        },
        **kwargs
    )

def retrieve_schema(**kwargs):
    return swagger_auto_schema(
        operation_description="Retrieve a specific item",
        responses={
            200: openapi.Response('Success'),
            **common_responses()
        },
        **kwargs
    )

def create_schema(**kwargs):
    return swagger_auto_schema(
        operation_description="Create a new item",
        responses={
            201: openapi.Response('Created'),
            **common_responses()
        },
        **kwargs
    )

def update_schema(**kwargs):
    return swagger_auto_schema(
        operation_description="Update an existing item",
        responses={
            200: openapi.Response('Success'),
            **common_responses()
        },
        **kwargs
    )

def delete_schema(**kwargs):
    return swagger_auto_schema(
        operation_description="Delete an item",
        responses={
            204: openapi.Response('No Content'),
            **common_responses()
        },
        **kwargs
    ) 