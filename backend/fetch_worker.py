from nba_api.stats.static import players
from nba import build_player_summary
from database import db
from datetime import datetime

player_cache = db["player_cache"]

def fetch_player(name):
    results = players.find_players_by_full_name(name)
    if not results:
        print("Player not found:", name)
        return

    player_id = results[0]["id"]

    summary = build_player_summary(player_id)

    player_cache.update_one(
        {"player_id": player_id},
        {
            "$set": {
                "player_id": player_id,
                "summary": summary,
                "last_updated": datetime.utcnow()
            }
        },
        upsert=True
    )

    print("Stored:", name)

def run_batch():
    with open("players.txt") as f:
        for line in f:
            name = line.strip()
            if name:
                fetch_player(name)

if __name__ == "__main__":
    run_batch()
