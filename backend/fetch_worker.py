from datetime import datetime
from database import db
from services.fetch_service import fetch_player_data

player_cache = db["player_cache"]
fetch_queue = db["fetch_queue"]


def run_queue():
    print("Worker started.")

    while True:
        job = fetch_queue.find_one()
        if not job:
            break

        player_id = job["player_id"]
        print("Fetching player_id:", player_id)

        try:
            data = fetch_player_data(player_id)

            player_cache.update_one(
                {"player_id": player_id},
                {
                    "$set": {
                        "player_id": player_id,
                        "data": data,
                        "last_updated": datetime.utcnow()
                    }
                },
                upsert=True
            )

            print("Stored:", player_id)

        except Exception as e:
            print("Fetch failed:", e)

        fetch_queue.delete_one({"_id": job["_id"]})


if __name__ == "__main__":
    run_queue()

