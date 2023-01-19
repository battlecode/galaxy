# An API-esque module for our usage.
# Commands here are not very generic (like a good API),
# and are instead tailored to Battlecode's specific usage,
# to improve dev efficiency

import requests
from django.apps import apps
from django.conf import settings

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


def create_tournament(
    tournament_id,
    tournament_name,
    is_private,
    style,
):
    from siarnaq.api.episodes.models import TournamentStyle

    # Challonge wants a specific string for tournament type.
    tournament_type = (
        "single elimination"
        if style == TournamentStyle.SINGLE_ELIMINATION
        else "double elimination"
    )

    url = f"{URL_BASE}tournaments.json"

    payload = {
        "data": {
            "type": "tournaments",
            "attributes": {
                "name": tournament_name,
                "tournament_type": tournament_type,
                "private": is_private,
                "url": tournament_id,
            },
        }
    }

    r = requests.post(url, headers=_headers, json=payload)
    r.raise_for_status()


def bulk_add_participants(tournament_id, participants):
    """
    Adds participants in bulk.
    Expects `participants` to be formatted in the format Challonge expects.
    Note especially that seeds must be 1-indexed.
    """
    url = f"{URL_BASE}tournaments/{tournament_id}/participants/bulk_add.json"

    payload = {
        "data": {
            "type": "Participant",
            "attributes": {
                "participants": participants,
            },
        }
    }

    r = requests.post(url, headers=_headers, json=payload)
    r.raise_for_status()


def start_tournament(tournament_id):
    url = f"{URL_BASE}tournaments/{tournament_id}/change_state.json"

    payload = {"data": {"type": "TournamentState", "attributes": {"state": "start"}}}

    r = requests.put(url, headers=_headers, json=payload)
    r.raise_for_status()


def get_tournament_data(tournament_id):
    url = f"{URL_BASE}tournaments/{tournament_id}.json"

    r = requests.get(url, headers=_headers)
    r.raise_for_status()
    return r.json()


def get_round_indexes(tournament_id):
    tournament_data = get_tournament_data(tournament_id)

    round_indexes = set()
    for item in tournament_data["included"]:
        match item:
            case {"type": "match", "attributes": {"round": round_index}}:
                round_indexes.add(round_index)

    return round_indexes


def get_match_and_participant_objects_for_round(tournament_id, round):
    tournament_data = get_tournament_data(tournament_id)
    # Derive match dicts/JSON objects (that Challonge gives us) of this round
    challonge_matches = []
    # Also derive participant dicts/JSON objects that Challonge gives us,
    # and map them with IDs for easy lookup
    challonge_participants = dict()

    for item in tournament_data["included"]:
        match item:
            case {
                "type": "match",
                "attributes": {"round": round.challonge_id, "state": state},
            }:
                # Only enqueue the round if all matches are "open".
                # NOTE: it would be good to have a "force re-enqueue round",
                # which re-enqueues matches even if matches or round
                # already in progress.
                # This would change the following check --
                # matches could be open _or done_.
                # !!! This is also _really hard_ right now
                # cuz it involves match deletion which is really hard.
                # Track in #549
                if state != "open":
                    # For later, have this raise a more specific exception.
                    # Then have the caller handle this return
                    # and translate it into an HTTP response.
                    raise RuntimeError(
                        "The bracket service's round does not only\
                            have matches that are ready."
                    )
                challonge_matches.append(item)

            case {"type": "participant", "id": id}:
                challonge_participants[id] = item

    match_objects = []
    match_participant_objects = []

    for challonge_match in challonge_matches:
        match_object = apps.get_model("compete", "Match")(
            episode=round.tournament.episode,
            tournament_round=round,
            alternate_order=True,
            is_ranked=False,
            challonge_id=challonge_match["id"],
        )
        match_objects.append(match_object)

        # Note that Challonge 1-indexes its player indexes
        # while Saturn 0-indexes.
        for (challonge_player_index, saturn_player_index) in (
            ("player1", 0),
            ("player2", 1),
        ):
            # This looks ugly but it's how to parse through the Challonge-related data.
            challonge_participant_id = challonge_match["relationships"][
                challonge_player_index
            ]["data"]["id"]
            challonge_participant_misc_key = challonge_participants[
                challonge_participant_id
            ]["attributes"]["misc"]
            team_id, submission_id = (
                int(_) for _ in challonge_participant_misc_key.split(",")
            )

            match_participant_object = apps.get_model("compete", "MatchParticipant")(
                team_id=team_id,
                submission_id=submission_id,
                match=match_object,
                player_index=saturn_player_index,
                challonge_id=challonge_participant_id,
            )
            match_participant_objects.append(match_participant_object)

    return match_objects, match_participant_objects


def update_match(tournament_id, match_id, match):
    url = f"{URL_BASE}tournaments/{tournament_id}/matches/{match_id}.json"

    # Wrangle the Match object into a format Challonge likes.
    # In particular, Challonge wants an array of objects,
    # each of which represents a participant's data.
    # The data is id, score, and whether or not they advance.

    participants_for_challonge = []

    # Build this array while also tracking high score (for computing who advances).
    high_score = -1
    for participant in match.participants.all():
        score = participant.score
        participants_for_challonge.append(
            {"participant_id": participant.challonge_id, "score": score}
        )
        if score >= high_score:
            high_score = score

    # Assign the "advance" flag, for those that have the high score.
    for participant in participants_for_challonge:
        participant["advancing"] = True if participant["score"] == high_score else False

    # Convert "score" to a string for Challonge.
    # (This is required because Challonge supports scores of sets,
    # which are comma-delimited lists of numbers.
    # We don't use this though)
    for participant in participants_for_challonge:
        participant["score"] = str(participant["score"])

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
