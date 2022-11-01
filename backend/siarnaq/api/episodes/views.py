from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from siarnaq.api.episodes.models import Episode
from siarnaq.api.episodes.serializers import AutoscrimSerializer, EpisodeSerializer


class EpisodeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for retrieving Episodes.
    """

    serializer_class = EpisodeSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return Episode.objects.visible_to_user(is_staff=self.request.user.is_staff)

    @extend_schema(
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(
                description="Created successfully"
            )
        }
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAdminUser,),
        serializer_class=AutoscrimSerializer,
    )
    def autoscrim(self, request, pk=None):
        """Trigger a round of autoscrimmages."""
        episode = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        episode.autoscrim(serializer.validated_data["best_of"])
        return Response(None, status=status.HTTP_204_NO_CONTENT)
