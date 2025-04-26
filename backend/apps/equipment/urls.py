from rest_framework_nested import routers
from django.urls import path, include
from .views import EquipmentViewSet, MaintenanceRecordViewSet

router = routers.DefaultRouter()
router.register(r'equipment', EquipmentViewSet)

equipment_router = routers.NestedDefaultRouter(router, r'equipment', lookup='equipment')
equipment_router.register(r'maintenance', MaintenanceRecordViewSet, basename='equipment-maintenance')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(equipment_router.urls)),
]