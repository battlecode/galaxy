from rest_framework import permissions


class IsAuthenticatedAsRequestedUser(permissions.BasePermission):
    message = "Must be authenticated as the requested user."

    def has_object_permission(self, request, _, obj):
        return request.user.is_authenticated and request.user.id == obj.user.id
