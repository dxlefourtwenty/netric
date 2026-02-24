import time
from nba_api.stats.static import players
from database import db

fetch_queue = db["fetch_queue"]
player_cache = db["player_cache"]

def seed_active_players():
    active_players = players.get_active_players()

    total = 0
    queued = 0
    skipped = 0

    for player in active_players:
        total += 1
        player_id = player["id"]
        name = player["full_name"]

        # Skip if already cached
        if player_cache.find_one({"player_id": player_id}):
            skipped += 1
            continue

        # Skip if already queued
        if fetch_queue.find_one({"player_id": player_id}):
            skipped += 1
            continue

        fetch_queue.insert_one({
            "player_id": player_id,
            "name": name
        })

        queued += 1
        print(f"Queued: {name}")

        # Small delay to avoid spamming Mongo
        time.sleep(1)

    print("----- DONE -----")
    print(f"Total active players: {total}")
    print(f"Queued: {queued}")
    print(f"Skipped (cached or already queued): {skipped}")

if __name__ == "__main__":
    seed_active_players()
