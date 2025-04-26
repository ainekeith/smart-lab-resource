from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admin users to access it.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.user_type == 'admin':
            return True
        return hasattr(obj, 'user') and obj.user == request.user

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `user`
        return hasattr(obj, 'user') and obj.user == request.user

class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow staff members to edit objects.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to staff members
        return request.user and request.user.is_staff

class IsStaffOrOwner(permissions.BasePermission):
    """
    Custom permission to only allow staff members or owners to access objects.
    """
    def has_object_permission(self, request, view, obj):
        # Staff members can do anything
        if request.user.is_staff:
            return True
        
        # Instance must have an attribute named `user`
        return hasattr(obj, 'user') and obj.user == request.user

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'admin'

class IsStaff(permissions.BasePermission):
    """
    Custom permission to only allow staff users to access the view.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'staff'

class IsStudent(permissions.BasePermission):
    """
    Custom permission to only allow student users to access the view.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'student'

class IsOwnerOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow owners or staff members to access objects.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.user_type in ['admin', 'staff']:
            return True
        return hasattr(obj, 'user') and obj.user == request.user