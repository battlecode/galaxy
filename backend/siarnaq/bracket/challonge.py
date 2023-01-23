from __future__ import annotations

import json
from typing import TYPE_CHECKING

import requests
from django.apps import apps
from django.conf import settings

if TYPE_CHECKING:
    from typing import Iterable

    from siarnaq.api.compete.models import Match, MatchParticipant
    from siarnaq.api.episodes.models import Tournament, TournamentRound
    from siarnaq.api.teams.models import Team


_headers = {
    "Accept": "application/json",
    "Authorization-Type": "v1",
    "Authorization": settings.CHALLONGE_API_KEY,
    "Content-Type": "application/vnd.api+json",
    # requests' default user agent causes Challonge's API to crash.
    "User-Agent": "",
}

AUTH_TYPE = "v1"
URL_BASE = "https://api.challonge.com/v2/"


def create_tournament(tournament: Tournament, *, is_private: bool):
    from siarnaq.api.episodes.models import TournamentStyle

    # Challonge does not allow hyphens in IDs, so substitute just in case
    tournament.external_id_public = tournament.external_id_public.replace("-", "_")
    tournament.external_id_private = tournament.external_id_private.replace("-", "_")

    # Challonge wants a specific string for tournament type.
    match tournament.style:
        case TournamentStyle.SINGLE_ELIMINATION:
            challonge_type = "single elimination"
        case TournamentStyle.DOUBLE_ELIMINATION:
            challonge_type = "double elimination"
        case _:
            raise ValueError

    challonge_id = (
        tournament.external_id_private if is_private else tournament.external_id_public
    )
    challonge_name = f"{tournament.name_long}{' (Private)' if is_private else ''}"

    url = f"{URL_BASE}tournaments.json"

    payload = {
        "data": {
            "type": "tournaments",
            "attributes": {
                "name": challonge_name,
                "tournament_type": challonge_type,
                "private": is_private,
                "url": challonge_id,
            },
        }
    }

    r = requests.post(url, headers=_headers, json=payload)
    r.raise_for_status()


def bulk_add_teams(tournament: Tournament, teams: Iterable[Team], *, is_private: bool):
    """
    Adds teams in bulk to a bracket.
    Expects `teams` to have active_submission included.
    """
    tournament_challonge_id = (
        tournament.external_id_private if is_private else tournament.external_id_public
    )

    # Challonge calls them "participants",
    # and expects data to be formatted in a particular way
    url = f"{URL_BASE}tournaments/{tournament_challonge_id}/participants/bulk_add.json"

    participants_for_challonge = [
        {
            "name": team.name,
            "seed": idx + 1,
            "misc": json.dumps(
                {"team_id": team.id, "submission_id": team.active_submission}
            ),
        }
        for (idx, team) in enumerate(teams)
    ]

    payload = {
        "data": {
            "type": "Participant",
            "attributes": {
                "participants": participants_for_challonge,
            },
        }
    }

    r = requests.post(url, headers=_headers, json=payload)
    r.raise_for_status()


def start_tournament(tournament: Tournament, *, is_private: bool):
    tournament_challonge_id = (
        tournament.external_id_private if is_private else tournament.external_id_public
    )

    url = f"{URL_BASE}tournaments/{tournament_challonge_id}/change_state.json"

    payload = {"data": {"type": "TournamentState", "attributes": {"state": "start"}}}

    r = requests.put(url, headers=_headers, json=payload)
    r.raise_for_status()


def get_tournament_data(tournament: Tournament, *, is_private: bool):
    tournament_challonge_id = (
        tournament.external_id_private if is_private else tournament.external_id_public
    )

    url = f"{URL_BASE}tournaments/{tournament_challonge_id}.json"

    r = requests.get(url, headers=_headers)
    r.raise_for_status()
    return r.json()


def get_round_indexes(tournament: Tournament, *, is_private: bool):
    tournament_data = get_tournament_data(tournament, is_private=is_private)

    round_indexes = set()
    for item in tournament_data["included"]:
        match item:
            case {"type": "match", "attributes": {"round": round_index}}:
                round_indexes.add(round_index)

    return round_indexes


def _pair_public_private_challonge_ids(tournament: Tournament):
    """
    Returns two dictionaries. The former maps private to public IDs of rounds;
    the latter maps private to public IDs of participants in the bracket.
    """
    tournament_data_private = get_tournament_data(tournament, is_private=False)
    tournament_data_public = get_tournament_data(tournament, is_private=False)

    # Collect the challonge JSONs of private matches and participants
    matches_private = []
    teams_private = []
    for item in tournament_data_private["included"]:
        match item:
            case {"type": "match"}:
                matches_private.append(item)
            case {"type": "participant"}:
                teams_private.append(item)

    # Same for public
    matches_public = []
    teams_public = []
    for item in tournament_data_public["included"]:
        match item:
            case {"type": "match"}:
                matches_public.append(item)
            case {"type": "participant"}:
                teams_public.append(item)

    # Compute a correspondence between the two.
    # Currently, we use the fact that IDs are in the same order for all tournaments.
    # You could also use other fields, such as Challonge's `identifier` or
    # `suggested_play_order` for matches; these are equal across brackets.
    # Similarly you could use `seed` for teams.
    matches_private.sort(key=lambda i: i["id"])
    matches_public.sort(key=lambda i: i["id"])
    matches_private_to_public = dict()
    for match_private, match_public in zip(matches_private, matches_public):
        id_private = match_private["id"]
        id_public = match_public["id"]
        matches_private_to_public[id_private] = id_public

    teams_private.sort(key=lambda i: i["id"])
    teams_public.sort(key=lambda i: i["id"])
    teams_private_to_public = dict()
    for team_private, team_public in zip(teams_private, teams_public):
        id_private = team_private["id"]
        id_public = team_public["id"]
        teams_private_to_public[id_private] = id_public

    return matches_private_to_public, teams_private_to_public


def get_match_and_participant_objects_for_round(round: TournamentRound):
    tournament_data_private = get_tournament_data(round.tournament, is_private=True)
    # Derive private match dicts/JSON objects (that Challonge gives us) of this round
    challonge_matches = []
    # Also derive participant dicts/JSON objects that Challonge gives us,
    # and map them with IDs for easy lookup
    challonge_participants = dict()

    for item in tournament_data_private["included"]:
        match item:
            case {
                "type": "match",
                "attributes": {"round": round.external_id, "state": state},
            }:
                # Only enqueue the round if all matches are "open".
                # NOTE: it would be good to have a "force re-enqueue round",
                # which re-enqueues matches even if matches or round
                # already in progress.
                # This would change the following check --
                # matches could be open _or done_.
                # !!! This is also _really hard_ right now
                # cuz it involves match deletion which is really hard.
                # Track in #594
                if state != "open":
                    raise RuntimeError(
                        "The bracket service's round does not only\
                            have matches that are ready."
                    )
                challonge_matches.append(item)

            case {"type": "participant", "id": id}:
                challonge_participants[id] = item

    # We also want to associate our match objects
    # with the _public_ version of their external ID.
    (
        challonge_match_ids_private_to_public,
        challonge_team_ids_private_to_public,
    ) = _pair_public_private_challonge_ids(round.tournament)

    match_objects = []
    match_participant_objects = []

    for challonge_match in challonge_matches:
        challonge_id_private = challonge_match["id"]
        match_object = apps.get_model("compete", "Match")(
            episode=round.tournament.episode,
            tournament_round=round,
            alternate_order=True,
            is_ranked=False,
            external_id_private=challonge_id_private,
            external_id_public=challonge_match_ids_private_to_public[
                challonge_id_private
            ],
        )
        match_objects.append(match_object)

        # Note that Challonge 1-indexes its player indexes
        # while our internal data model (in Siarnaq) 0-indexes.
        for (siarnaq_player_index, challonge_player_index) in enumerate(
            ["player1", "player2"]
        ):
            # This looks ugly but it's how to parse through the Challonge-related data.
            challonge_participant_id_private = challonge_match["relationships"][
                challonge_player_index
            ]["data"]["id"]
            challonge_participant_id_public = challonge_team_ids_private_to_public[
                challonge_participant_id_private
            ]
            misc_key = json.loads(
                challonge_participants[challonge_participant_id_private]["attributes"][
                    "misc"
                ]
            )
            team_id = misc_key["team_id"]
            submission_id = misc_key["submission_id"]

            match_participant_object = apps.get_model("compete", "MatchParticipant")(
                team_id=team_id,
                submission_id=submission_id,
                match=match_object,
                player_index=siarnaq_player_index,
                external_id_private=challonge_participant_id_private,
                external_id_public=challonge_participant_id_public,
            )
            match_participant_objects.append(match_participant_object)

    return match_objects, match_participant_objects


def update_match(match: Match, *, is_private: bool):
    tournament: Tournament = match.tournament_round.tournament

    tournament_challonge_id = (
        tournament.external_id_private if is_private else tournament.external_id_public
    )

    match_challonge_id = match.external_id_private if is_private else None

    url = (
        f"{URL_BASE}tournaments/{tournament_challonge_id}/"
        f"matches/{match_challonge_id}.json"
    )

    # Wrangle the Match object into a format Challonge likes.
    # In particular, Challonge wants an array of objects,
    # each of which represents a participant's data.
    # The data is id, score, and whether or not they advance.

    # To assign the "advance" flag, compute the high score,
    # and then set the flag for those that have the high score.

    # Also, we convert "score" to a string for Challonge.
    # (This is required because Challonge supports scores of sets,
    # which are comma-delimited lists of numbers.
    # We don't use scores of sets in Challonge though, so we format our score
    # as a one-item set.)

    participants: list[MatchParticipant] = list(match.participants.all())
    high_score = max(participant.score for participant in participants)
    participants_for_challonge = [
        {
            "participant_id": participant.external_id,
            "score_set": str(participant.score),
            "advancing": True if participant.score == high_score else False,
        }
        for participant in participants
    ]

    payload = {
        "data": {
            "type": "Match",
            "attributes": {
                "match": participants_for_challonge,
            },
        }
    }

    print(payload)

    r = requests.put(url, headers=_headers, json=payload)
    r.raise_for_status()
