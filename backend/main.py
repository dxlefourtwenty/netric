from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.library.http import NBAStatsHTTP

import time

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NBAStatsHTTP.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://www.nba.com/",
    "Origin": "https://www.nba.com"
})

@app.get("/search/{name}")
def search_player(name: str):
    try:
        results = players.find_players_by_full_name(name)
        if not results:
            raise HTTPException(status_code=404, detail="Player not found")

        player_id = results[0]['id']

        # small delay to avoid rate limit
        time.sleep(1)

        career = playercareerstats.PlayerCareerStats(
            player_id=player_id,
            timeout=60
        )

        df = career.get_data_frames()[0]

        return {
            "player_id": player_id,
            "stats": df.to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
