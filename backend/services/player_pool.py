from nba_api.stats.endpoints import commonallplayers
from nba_api.stats.static import players


DEFAULT_PREVIOUS_SEASON = "2024-25"


def normalize_player_record(player_id, full_name):
    return {
        "id": int(player_id),
        "full_name": str(full_name).strip(),
    }


def get_current_active_players():
    return [
        normalize_player_record(player["id"], player["full_name"])
        for player in players.get_active_players()
    ]


def get_active_players_for_season(season_id: str):
    season_players = commonallplayers.CommonAllPlayers(
        league_id="00",
        season=season_id,
        is_only_current_season=1,
        timeout=30,
    ).get_data_frames()[0]

    if season_players.empty:
        return []

    normalized_players = []

    for _, player in season_players.iterrows():
        player_id = player.get("PERSON_ID")
        full_name = player.get("DISPLAY_FIRST_LAST")

        if not player_id or not full_name:
            continue

        normalized_players.append(normalize_player_record(player_id, full_name))

    return normalized_players


def get_tracked_players(previous_season_id: str = DEFAULT_PREVIOUS_SEASON):
    players_by_id = {
        player["id"]: player
        for player in get_current_active_players()
    }

    for player in get_active_players_for_season(previous_season_id):
        players_by_id.setdefault(player["id"], player)

    return list(players_by_id.values())
