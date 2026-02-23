import time
import requests
from fastapi import HTTPException
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.library.http import NBAStatsHTTP

NBAStatsHTTP.headers.update({
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nba.com/",
    "Origin": "https://www.nba.com",
    "Connection": "keep-alive",
})

def search_player_stats(name: str):
    name = name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Missing name")

    results = players.find_players_by_full_name(name)
    if not results:
        raise HTTPException(status_code=404, detail="Player not found")

    player_id = results[0]["id"]

    # tiny delay to reduce rate limiting
    time.sleep(0.6)

    # retry once if nba.com flakes
    last_err = None
    for _ in range(2):
        try:
            career = playercareerstats.PlayerCareerStats(
                player_id=player_id,
                timeout=90,   # IMPORTANT
            )
            df = career.get_data_frames()[0]
            return {"player_id": player_id, "stats": df.to_dict(orient="records")}
        except requests.exceptions.ReadTimeout as e:
            last_err = e
        except Exception as e:
            last_err = e

        time.sleep(0.8)

    raise HTTPException(status_code=504, detail=f"NBA stats request timed out: {last_err}")
