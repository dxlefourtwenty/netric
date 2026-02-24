from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats, playergamelog
from database import db
from datetime import datetime

player_cache = db["player_cache"]

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

    gamelog = playergamelog.PlayerGameLog(
        player_id=player_id,
        timeout=30
    )
    games_df = gamelog.get_data_frames()[0]

    summary_data = {
        "player_id": player_id,
        "name": results[0]["full_name"],
        "career_stats": df.to_dict(orient="records"),
        "game_log": games_df.to_dict(orient="records")
    }

    player_cache.update_one(
        {"player_id": player_id},
        {
            "$set": {
                "player_id": player_id,
                "data": summary_data,
                "last_updated": datetime.utcnow()
            }
        },
        upsert=True
    )

    return summary_data

def fetch_player_data(player_id: int):
    player_info = players.find_player_by_id(player_id)
    if not player_info:
        raise Exception("Player not found")

    name = player_info["full_name"]

    career = playercareerstats.PlayerCareerStats(player_id=player_id)
    career_df = career.get_data_frames()[0]

    gamelog = playergamelog.PlayerGameLog(player_id=player_id)
    game_df = gamelog.get_data_frames()[0]

    return {
        "player_id": player_id,
        "name": name,
        "career_stats": career_df.to_dict("records"),
        "game_log": game_df.to_dict("records"),
    }

