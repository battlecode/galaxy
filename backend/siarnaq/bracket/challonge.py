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
                "match_options": {"accept_attachments": True},
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
    data = r.json()

    # Handle bracket-reset finals by internally splitting it up into two rounds,
    # which Challonge does not do by default.
    from siarnaq.api.episodes.models import TournamentStyle

    if tournament.style == TournamentStyle.DOUBLE_ELIMINATION:
        # Find the very last match (by play order),
        # which is the second match of finals
        # in case of bracket reset
        matches = [item for item in data["included"] if item["type"] == "match"]
        match_last = max(
            matches, key=lambda match: match["attributes"]["suggestedPlayOrder"]
        )
        # Give it its own round
        match_last["attributes"]["round"] += 1

    return data


def _get_round_indexes(tournament: Tournament, *, is_private: bool):
    """
    Returns round indexes of the tournament,
    in order of Challonge's suggested play order.
    """
    tournament_data = get_tournament_data(tournament, is_private=is_private)

    round_indexes = list()

    matches = [item for item in tournament_data["included"] if item["type"] == "match"]
    matches.sort(key=lambda i: i["attributes"]["suggestedPlayOrder"])

    for match in matches:
        round_index = match["attributes"]["round"]
        if round_index not in round_indexes:
            round_indexes.append(round_index)

    return round_indexes


def _get_round_indexes_and_names(tournament: Tournament, *, is_private: bool):
    """
    Based on empirical observation and design principles,
    we declare any losers' rounds to be part of the same "overall" round
    that
    """
    from siarnaq.api.episodes.models import TournamentStyle

    round_indexes = _get_round_indexes(tournament, is_private=is_private)

    round_indexes_and_names = []

    if tournament.style == TournamentStyle.SINGLE_ELIMINATION:
        for round_index in round_indexes:
            round_indexes_and_names.append((round_index, f"Round {round_index}"))
        return round_indexes_and_names

    if tournament.style != TournamentStyle.DOUBLE_ELIMINATION:
        raise NotImplementedError("Unsupported tournament style")

    current_winners_round_number = None
    for position, round_index in enumerate(round_indexes):
        if round_index > 0:
            current_winners_round_number = round_index
            round_type = "(Winners)"
        else:
            # We are processing losers' rounds.
            # Use the same round "number" as the most recent winners round.
            is_next_round_winners = round_indexes[position + 1] > 0

            if is_next_round_winners:
                # The next round is a winners' round
                # so this round is a "major" losers' round.
                round_type = "(Losers Major)"
            else:
                # The next round is a losers' round,
                # so this round is a "minor" losers' round.
                round_type = "(Losers Minor)"

        round_indexes_and_names.append(
            (round_index, f"Round {current_winners_round_number} {round_type}")
        )

    return round_indexes_and_names


def create_round_objects(tournament: Tournament):
    from siarnaq.api.episodes.models import TournamentRound

    round_indexes_and_names = _get_round_indexes_and_names(tournament, is_private=True)

    round_objects = [
        TournamentRound(
            tournament=tournament,
            external_id=round_index,
            name=round_name,
            display_order=display_order,
        )
        for display_order, (round_index, round_name) in enumerate(
            round_indexes_and_names
        )
    ]

    return round_objects


def _pair_private_public_challonge_ids(tournament: Tournament, type: str):
    """
    Returns a dictionary, mapping private IDs to public IDs,
    for all items of a given type in Challonge.
    """
    tournament_data_private = get_tournament_data(tournament, is_private=True)
    tournament_data_public = get_tournament_data(tournament, is_private=False)

    # Collect the challonge JSONs of private items
    items_private = [
        item for item in tournament_data_private["included"] if item["type"] == type
    ]
    items_public = [
        item for item in tournament_data_public["included"] if item["type"] == type
    ]

    # Compute a correspondence between the two.
    # Currently, we use the fact that IDs are in the same order for all tournaments.
    # You could also use other fields, such as Challonge's `identifier` or
    # `suggestedPlayOrder` for matches; these are equal across brackets.
    # Similarly you could use `seed` for teams.
    items_private.sort(key=lambda i: i["id"])
    items_public.sort(key=lambda i: i["id"])
    items_private_to_public = dict()
    for item_private, item_public in zip(items_private, items_public):
        id_private = item_private["id"]
        id_public = item_public["id"]
        items_private_to_public[id_private] = id_public
    return items_private_to_public


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

    # We also want to associate our objects
    # with the _public_ version of their external ID.
    challonge_match_ids_private_to_public = _pair_private_public_challonge_ids(
        round.tournament, "match"
    )
    challonge_team_ids_private_to_public = _pair_private_public_challonge_ids(
        round.tournament, "participant"
    )

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

    match_challonge_id = (
        match.external_id_private if is_private else match.external_id_public
    )

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
            "participant_id": participant.external_id_private
            if is_private
            else participant.external_id_public,
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

    r = requests.put(url, headers=_headers, json=payload)
    r.raise_for_status()
