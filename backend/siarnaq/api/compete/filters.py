from rest_framework import filters


class IsSubmissionCreatorFilterBackend(filters.BaseFilterBackend):
    """Filter that only allows users to see their own submissions."""

    def filter_queryset(self, request, queryset, view):
        return queryset.filter(team__members=request.user)
