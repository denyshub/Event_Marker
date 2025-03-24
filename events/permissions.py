from rest_framework.permissions import BasePermission


class IsEventAuthor(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.organizer == request.user


class IsEventAuthorOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.organizer == request.user or request.user.is_staff
