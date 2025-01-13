from rest_framework import filters


class TeamOrderingFilter(filters.OrderingFilter):
    FIELD_TRANSFORMS = {
        "rating": "profile__rating__value",
    }
    """A mapping of ordering field shortcuts to their actual field."""

    ordering_fields = list(FIELD_TRANSFORMS.keys())
    """A list of valid ordering keys recognized by this filter."""

    def filter_queryset(self, request, queryset, view):
        ordering = self.get_ordering(request, queryset, view)

        if ordering:
            ordering = [self.transform(term) for term in ordering]
            return queryset.order_by(*ordering)

        return queryset

    def transform(self, term):
        prefix = ""
        if term.startswith("-"):
            prefix, term = "-", term[1:]
        return prefix + self.FIELD_TRANSFORMS.get(term, term)


class TeamActiveSubmissionFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        if "has_active_submission" not in request.query_params:
            return queryset
        return queryset.filter(submissions__accepted=True).distinct()


class TeamEligibilityFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        if "eligible_for" not in request.query_params:
            return queryset
        return queryset.filter(
            profile__eligible_for__in=request.query_params.getlist("eligible_for")
        )
