from datetime import datetime
from database import db
from services.fetch_service import fetch_player_data

player_cache = db["player_cache"]
fetch_queue = db["fetch_queue"]

MAX_PER_RUN = 5  # adjust as needed

def run_queue():
    print("Worker started.")

    processed = 0

    while processed < MAX_PER_RUN:
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
        processed += 1

    print(f"Processed {processed} players this run.")


if __name__ == "__main__":
    run_queue()
