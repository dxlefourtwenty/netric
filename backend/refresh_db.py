from datetime import datetime
from database import db

player_cache = db["player_cache"]
fetch_queue = db["fetch_queue"]

def refresh_all_players():
    players = player_cache.find({}, {"player_id": 1, "name": 1})

    count = 0

    for player in players:
        player_id = player["player_id"]
        name = player.get("name")

        # Skip if already queued
        if fetch_queue.find_one({"player_id": player_id}):
            continue

        fetch_queue.insert_one({
            "player_id": player_id,
            "name": name,
            "refresh": True,
            "queued_at": datetime.utcnow()
        })

        count += 1

    print(f"Queued {count} players for refresh.")

if __name__ == "__main__":
    refresh_all_players()
