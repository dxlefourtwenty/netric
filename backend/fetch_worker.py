from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats, playergamelog
from database import db
from datetime import datetime
import sys

player_cache = db["player_cache"]

def fetch_player(name):
    results = players.find_players_by_full_name(name)
    if not results:
        print("Player not found")
        return

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

    result = {
        "player_id": player_id,
        "career_stats": df.to_dict(orient="records"),
        "game_log": games_df.to_dict(orient="records"),
        "last_updated": datetime.utcnow()
    }

    player_cache.update_one(
        {"player_id": player_id},
        {"$set": result},
        upsert=True
    )

    print("Stored:", name)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fetch_worker.py 'LeBron James'")
    else:
        fetch_player(sys.argv[1])
