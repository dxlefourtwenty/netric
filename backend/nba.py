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

def get_player_summary(player_id: int):

    # ---------- 1️⃣ Check cache ----------
    cached = player_cache.find_one({"player_id": player_id})

    if cached:
        cached_data = cached.get("data")
        last_updated = cached.get("last_updated")

        # Validate structure + freshness
        if (
            cached_data
            and "name" in cached_data
            and "season_stats" in cached_data
            and "headshot_url" in cached_data
            and last_updated
            and last_updated > datetime.utcnow() - timedelta(hours=6)
        ):
            return cached_data

    # ---------- 2️⃣ Fetch player info ----------
    player_info = players.find_player_by_id(player_id)
    if not player_info:
        raise HTTPException(status_code=404, detail="Player not found")

    player_name = player_info["full_name"]

    # ---------- 3️⃣ Fetch season stats ----------
    career = playercareerstats.PlayerCareerStats(player_id=player_id)
    df = career.get_data_frames()[0]

    if df.empty:
        raise HTTPException(status_code=404, detail="No stats found")

    df = df[df["GP"] > 0]

    if df.empty:
        raise HTTPException(status_code=404, detail="No valid seasons")

    df = df.sort_values("SEASON_ID", ascending=False)
    latest = df.iloc[0]

    # Basic season totals
    pts = float(latest["PTS"])
    ast = float(latest["AST"])
    reb = float(latest["REB"])
    stl = float(latest["STL"])
    blk = float(latest["BLK"])
    tov = float(latest["TOV"])
    min_total = float(latest["MIN"])

    fg_pct = float(latest["FG_PCT"])
    fg3_pct = float(latest["FG3_PCT"])

    fgm = float(latest["FGM"])
    fga = float(latest["FGA"])

    fg3m = float(latest["FG3M"])
    fg3a = float(latest["FG3A"])

    fta = float(latest["FTA"])
    ftm = float(latest["FTM"])

    gp = int(latest["GP"])

    fg2pm = fgm - fg3m
    fg2pa = fga - fg3a

    # Advanced calculations
    ts_pct = (
        pts / (2 * (fga + 0.44 * fta))
        if (fga + 0.44 * fta) > 0
        else 0
    )

    efg_pct = (
        (float(latest["FGM"]) + 0.5 * fg3m) / fga
        if fga > 0
        else 0
    )

    # ---------- 4️⃣ Fetch last game ----------
    gamelog = playergamelog.PlayerGameLog(player_id=player_id)
    games_df = gamelog.get_data_frames()[0]

    last_game_data = None

    if not games_df.empty:
        games_df["GAME_DATE"] = pd.to_datetime(games_df["GAME_DATE"])
        games_df = games_df.sort_values("GAME_DATE", ascending=False)

        last = games_df.iloc[0]

        last_game_data = {
            "date": last["GAME_DATE"].strftime("%m/%d"),
            "matchup": str(last["MATCHUP"]),
            "pts": int(last["PTS"]),
            "ast": int(last["AST"]),
            "reb": int(last["REB"]),
        }

    # ---------- 5️⃣ Build clean result ----------
    result = {
        "player_id": int(player_id),
        "name": player_name,
        "season": str(latest["SEASON_ID"]),
        "season_stats": {
            "pts": pts,
            "ast": ast,
            "reb": reb,
            "stl": stl,
            "blk": blk,
            "tov": tov,
            "min_total": min_total,
            "gp": gp,

            "fg_pct": fg_pct,
            "fg3_pct": fg3_pct,
            "fgm" : fgm,
            "fga" : fga,
            "fg2pm" : fg2pm,
            "fg2pa" : fg2pa,
            "three_pm": fg3m,
            "three_pa": fg3a,
            "fta": fta,
            "ftm": ftm,

            "ts_pct": ts_pct,
            "efg_pct": efg_pct,
        },
        "last_game": last_game_data,
        "headshot_url": f"https://cdn.nba.com/headshots/nba/latest/1040x760/{player_id}.png"
    }

    # ---------- 6️⃣ Save to cache ----------
    player_cache.update_one(
        {"player_id": player_id},
        {
            "$set": {
                "player_id": player_id,
                "data": result,
                "last_updated": datetime.utcnow()
            }
        },
        upsert=True
    )

    return result
