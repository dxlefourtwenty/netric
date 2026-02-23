import time
import requests
from fastapi import HTTPException
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats, playergamelog
from nba_api.stats.library.http import NBAStatsHTTP

import pandas as pd
import numpy as np

from database import db
from datetime import datetime, timedelta

player_cache = db["player_cache"]

player_cache.create_index("player_id", unique=True)
player_cache.create_index("last_updated")

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

    cached = player_cache.find_one({"player_id": player_id})

    if not cached:
        raise HTTPException(
            status_code=404,
            detail="Player not cached yet. Run fetch worker first."
        )

    return cached["data"]

def get_player_summary(player_id: int):

    cached = player_cache.find_one({"player_id": player_id})

    if not cached:
        raise HTTPException(
            status_code=404,
            detail="Player not cached yet. Run fetch worker first."
        )

    return cached["data"]
