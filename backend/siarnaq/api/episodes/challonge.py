# An API-esque module for our usage.
# Commands here are not very generic (like a good API),
# and are instead tailored to Battlecode's specific usage,
# to improve dev efficiency

import requests
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


def set_api_key(api_key):
    """Set the challonge.com api credentials to use."""
    _headers["Authorization"] = api_key


def create_tournament(
    tournament_url, tournament_name, is_private=True, is_single_elim=True
):
    tournament_type = "single elimination" if is_single_elim else "double elimination"

    url = f"{URL_BASE}tournaments.json"

    payload = {
        "data": {
            "type": "tournaments",
            "attributes": {
                "name": tournament_name,
                "tournament_type": tournament_type,
                "private": is_private,
                "url": tournament_url,
            },
        }
    }

    r = requests.post(url, headers=_headers, json=payload)
    r.raise_for_status()


def bulk_add_participants(tournament_url, participants):
    """
    Adds participants in bulk.
    Expects `participants` to be formatted in the format Challonge expects.
    Note especially that seeds must be 1-indexed.
    """
    url = f"{URL_BASE}tournaments/{tournament_url}/participants/bulk_add.json"

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


def start_tournament(tournament_url):
    url = f"{URL_BASE}tournaments/{tournament_url}/change_state.json"

    payload = {"data": {"type": "TournamentState", "attributes": {"state": "start"}}}

    r = requests.put(url, headers=_headers, json=payload)
    r.raise_for_status()


def get_tournament(tournament_url):
    url = f"{URL_BASE}tournaments/{tournament_url}.json"

    r = requests.get(url, headers=_headers)
    r.raise_for_status()
    return r.json()

