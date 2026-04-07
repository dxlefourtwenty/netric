from datetime import UTC, datetime

from nba_api.stats.static import players

from database import db
from services.fetch_service import (
    get_latest_cached_game_date,
    get_latest_remote_game_date,
)

player_cache = db["player_cache"]
fetch_queue = db["fetch_queue"]


def build_refresh_job(player_id, name):
    return {
        "player_id": player_id,
        "name": name,
        "refresh": True,
        "queued_at": datetime.now(UTC),
    }


def is_already_queued(player_id):
    return fetch_queue.find_one({"player_id": player_id}) is not None


def find_cached_player(player_id):
    return player_cache.find_one({"player_id": player_id}, {"data.game_log": 1})


def should_refresh_player(player_id):
    cached_player = find_cached_player(player_id)
    cached_latest_game = get_latest_cached_game_date(cached_player)

    if cached_latest_game is None:
        return True

    remote_latest_game = get_latest_remote_game_date(player_id)
    if remote_latest_game is None:
        return False

    return remote_latest_game > cached_latest_game


def refresh_all_players():
    active_players = players.get_active_players()

    queued_count = 0
    skipped_count = 0
    failed_count = 0

    for player in active_players:
        player_id = player["id"]
        name = player["full_name"]

        if is_already_queued(player_id):
            skipped_count += 1
            continue

        try:
            if not should_refresh_player(player_id):
                skipped_count += 1
                continue
        except Exception as exc:
            failed_count += 1
            print(f"Refresh check failed for {player_id}: {exc}")
            continue

        fetch_queue.insert_one(build_refresh_job(player_id, name))
        queued_count += 1

    print(
        f"Queued {queued_count} active players for refresh. "
        f"Skipped {skipped_count}. Failed checks {failed_count}."
    )


if __name__ == "__main__":
    refresh_all_players()
