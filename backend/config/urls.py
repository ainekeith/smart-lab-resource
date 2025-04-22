"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import UserViewSet
from apps.accounts.auth import CustomTokenObtainPairView, TokenVerifyView
from apps.bookings.views import BookingViewSet
from apps.equipment.views import EquipmentViewSet, MaintenanceLogViewSet
from apps.inventory.views import InventoryItemViewSet, StockMovementViewSet
from apps.notifications.views import NotificationViewSet
from apps.reports.views import ReportViewSet

# Schema view for API documentation
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

# Router for ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'equipment', EquipmentViewSet)
router.register(r'maintenance-logs', MaintenanceLogViewSet)
router.register(r'inventory-items', InventoryItemViewSet)
router.register(r'stock-movements', StockMovementViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    # Authentication URLs
    path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/', include('rest_framework.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/', include('dj_rest_auth.urls')),
    
    # API Documentation URLs
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]
