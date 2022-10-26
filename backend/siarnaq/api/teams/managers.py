import random

from django.apps import apps
from django.db import models, transaction
from django.db.models import OuterRef


def generate_4regular_graph(n):
    """
    Generate a 4-regular graph on n nodes labelled 0 through n-1. The graph is
    guaranteed to have the following properties:

    1. For each edge between two nodes x and y, |x-y| is small. In fact, |x-y| <= 4.
    2. For each node x except 0 and n-1, its neighbors are not all <x or all >x.

    Parameters
    ----------
    n : int
        The number of nodes in the graph, must be at least 5

    Returns
    -------
    List[Tuple(int, int)]
        A list of undirected edges where nodes are numbered from 0 to n-1, inclusive.
    """
    # At a high level, this algorithm works as follows:
    # 1. Partition the nodes into contiguous groups of size between 5-9, inclusive.
    # 2. Apply a pre-determined regular graph to each partition.
    # 3. To ensure the min and max in each partition also receive smaller and larger
    #    neighbors, redirect some edges to cross into the neighboring partitions.
    if n < 5:
        raise ValueError("Not enough nodes for 4-regular graph")

    # Step 1: Partition into groups. We use groups of size between 5-9, but prefer using
    # the smaller sizes 5 and 6 whenever possible. We manually solve the base cases in
    # which random choices might not be safe.
    partition_base_cases = ".....567895566755565555565"
    partition_sizes, remaining = [], n
    while remaining:
        if remaining < len(partition_base_cases):
            m = int(partition_base_cases[remaining])
        else:
            m = random.randint(5, 6)
        partition_sizes.append(m)
        remaining -= m
    random.shuffle(partition_sizes)

    # Step 2: Apply pre-determined regular graphs.
    predetermined = {
        5: "01 02 03 04 12 13 14 23 24 34",
        6: "01 02 03 04 12 13 15 24 25 34 35 45",
        7: "01 02 03 04 12 13 14 25 26 35 36 45 46 56",
        8: "01 02 03 04 12 13 14 25 26 35 37 46 47 56 57 67",
        9: "01 02 03 04 12 13 14 23 25 36 47 48 56 57 58 67 68 78",
    }
    adj_list = {i: [] for i in range(n)}
    start = 0
    for m in partition_sizes:
        for i, j in predetermined[m].split():
            adj_list[start + int(i)].append(start + int(j))
            adj_list[start + int(j)].append(start + int(i))
        start += m

    # Step 3: Redirect edges. For each pair of nodes (A, B) on a partition boundary, we
    # select a random neighbor for each of them, and make the following swap:
    #                       \                   .----\--.
    #                  C---A \ B---D    ===>    C   A \ B   D
    #                         \                     '--\----'
    # This transformation preserves node degrees so the graph continues to be 4-regular.
    # To ensure we do not create edges that are too long, we do not allow C and D to be
    # the furthest neighbors from A and B. This prevents the redirection operation from
    # repeatedly acting on the same edge and making it longer and longer.
    start = 0
    for m in partition_sizes[:-1]:
        a, b = start + m - 1, start + m
        c = random.choice(sorted(adj_list[a])[1:])
        d = random.choice(sorted(adj_list[b])[:-1])
        for x, y in [(a, c), (b, d)]:
            adj_list[x].remove(y)
            adj_list[y].remove(x)
        for x, y in [(b, c), (a, d)]:
            adj_list[x].append(y)
            adj_list[y].append(x)
        start += m

    # Convert to edge-list representation.
    return [(i, j) for i in range(n) for j in adj_list[i] if j > i]


class TeamQuerySet(models.QuerySet):
    def regular(self):
        """Filter for teams that are of regular status."""
        from siarnaq.api.teams.models import TeamStatus

        return self.filter(status=TeamStatus.REGULAR)

    def autoscrim(self, *, episode, best_of):
        """
        Generate ranked best-of-k scrimmages in a specified episode for all teams with
        an accepted submission. Each team receives exactly 4 scrimmages, unless there
        aren't enough teams, in which case a round-robin is played.

        Parameters
        ----------
        episode : Episode
            The episode for which scrimmages are to be generated.
        best_of : int
            The number of maps to be played in each match, must be no greater than the
            number of maps available for the episode.
        """

        maps = list(
            apps.get_model("episodes", "Map")
            .objects.filter(episode=episode, is_public=True)
            .values_list("pk", flat=True)
        )
        if best_of > len(maps):
            raise ValueError("Not enough maps available")

        # Get all regular teams who have an active submission, in decreasing order of
        # rating, along with their active submission id. We intentionally use the rating
        # mean and not the penalized rating value, to maximize the information-gain for
        # any new teams with extremely low penalized scores. We like high entropy!
        teams = (
            self.regular()
            .annotate(
                active_submission=apps.get_model("compete", "Submission")
                .objects.filter(team=OuterRef("pk"), accepted=True)
                .order_by("-pk")
                .values("pk")[:1]
            )
            .filter(episode=episode, active_submission__isnull=False)
            .order_by("-profile__rating__mean")
            .values("pk", "active_submission")
            .all()
        )

        if len(teams) <= 4:
            # Round-robin for small pool
            edges = [(i, j) for j in range(len(teams)) for i in range(j)]
        else:
            edges = generate_4regular_graph(len(teams))

        # Shuffle the edge direction so that player turn order is not biased
        for i in range(len(edges)):
            if random.randint(0, 1):
                edges[i] = edges[i][::-1]

        # Shuffle the edge ordering so that match queue priority is not biased
        random.shuffle(edges)

        # Create the participations and matches
        MatchParticipant = apps.get_model("compete", "MatchParticipant")
        Match = apps.get_model("compete", "Match")
        with transaction.atomic():
            participations = MatchParticipant.objects.bulk_create(
                MatchParticipant(
                    team_id=teams[node]["pk"],
                    submission_id=teams[node]["active_submission"],
                )
                for edge in edges
                for node in edge
            )
            if len(participations) % 2 != 0:
                raise RuntimeError("Unexpected odd number of participations")
            matches = Match.objects.bulk_create(
                Match(
                    episode=episode,
                    red=red,
                    blue=blue,
                    alternate_color=True,
                    is_ranked=True,
                )
                for red, blue in zip(participations[0::2], participations[1::2])
            )
            Match.maps.through.objects.bulk_create(
                Match.maps.through(match_id=match.pk, map_id=map_id)
                for match in matches
                for map_id in random.sample(maps, best_of)
            )

        # Send them to Saturn
        Match.objects.filter(pk__in=[match.pk for match in matches]).enqueue()
