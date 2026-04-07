from datetime import UTC, datetime

from nba_api.stats.endpoints import playercareerstats, playergamelog
from nba_api.stats.static import players

from database import db

player_cache = db["player_cache"]


def utc_now():
    return datetime.now(UTC)


def get_active_season_ids(career_df):
    if career_df.empty:
        return []

    active_seasons = career_df[career_df["GP"] > 0]["SEASON_ID"].dropna().astype(str).tolist()
    return sorted(set(active_seasons), reverse=True)


def fetch_game_logs_by_season(player_id: int, season_ids: list[str]):
    season_logs = {}

    for season_id in season_ids:
        gamelog = playergamelog.PlayerGameLog(
            player_id=player_id,
            season=season_id,
            timeout=30
        )
        season_logs[season_id] = gamelog.get_data_frames()[0].to_dict("records")

    return season_logs


def get_player_name(player_id: int):
    player_info = players.find_player_by_id(player_id)
    if not player_info:
        raise Exception("Player not found")

    return player_info["full_name"]


def get_latest_remote_game_date(player_id: int):
    gamelog = playergamelog.PlayerGameLog(player_id=player_id, timeout=30)
    game_df = gamelog.get_data_frames()[0]

    if game_df.empty:
        return None

    latest_date = game_df["GAME_DATE"].max()
    return datetime.strptime(latest_date, "%b %d, %Y").date()


def get_latest_cached_game_date(cached_player):
    if not cached_player:
        return None

    data = cached_player.get("data", {})
    game_log = data.get("game_log", [])
    if not game_log:
        return None

    latest_date = None

    for game in game_log:
        game_date = game.get("GAME_DATE")
        if not game_date:
            continue

        parsed_date = datetime.strptime(game_date, "%b %d, %Y").date()
        if latest_date is None or parsed_date > latest_date:
            latest_date = parsed_date

    return latest_date

def fetch_player_by_name(name: str):
    results = players.find_players_by_full_name(name)
    if not results:
        return None

    player_id = results[0]["id"]

    career = playercareerstats.PlayerCareerStats(
        player_id=player_id,
        timeout=30
    )
    df = career.get_data_frames()[0]
    season_ids = get_active_season_ids(df)
    season_logs = fetch_game_logs_by_season(player_id, season_ids)
    latest_season = season_ids[0] if season_ids else None

    summary_data = {
        "player_id": player_id,
        "name": results[0]["full_name"],
        "career_stats": df.to_dict(orient="records"),
        "game_log": season_logs.get(latest_season, []),
        "season_game_log": season_logs.get(latest_season, []),
        "season_game_logs": season_logs,
    }

    player_cache.update_one(
        {"player_id": player_id},
        {
            "$set": {
                "player_id": player_id,
                "data": summary_data,
                "last_updated": utc_now()
            }
        },
        upsert=True
    )

    return summary_data

def fetch_player_data(player_id: int):
    name = get_player_name(player_id)

    career = playercareerstats.PlayerCareerStats(player_id=player_id, timeout=30)
    career_df = career.get_data_frames()[0]
    season_ids = get_active_season_ids(career_df)
    season_logs = fetch_game_logs_by_season(player_id, season_ids)
    latest_season = season_ids[0] if season_ids else None

    return {
        "player_id": player_id,
        "name": name,
        "career_stats": career_df.to_dict("records"),
        "game_log": season_logs.get(latest_season, []),
        "season_game_log": season_logs.get(latest_season, []),
        "season_game_logs": season_logs,
    }
