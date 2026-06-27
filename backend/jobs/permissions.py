from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'recruiter'


class IsJobOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.recruiter == request.user
