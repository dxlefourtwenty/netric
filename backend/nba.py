import pandas as pd
from datetime import datetime
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats, playergamelog
from services.fetch_service import fetch_player_by_name
from fastapi import HTTPException

from database import db

player_cache = db["player_cache"]
fetch_queue = db["fetch_queue"]

def search_player_stats(name: str):
    results = players.find_players_by_full_name(name)
    if not results:
        raise HTTPException(status_code=404, detail="Player not found")

    player_id = results[0]["id"]

    cached = player_cache.find_one({"player_id": player_id})

    if cached:
        return build_player_summary(player_id)

    fetch_queue.update_one(
        {"player_id": player_id},
        {"$set": {"player_id": player_id, "name": name}},
        upsert=True
    )

    raise HTTPException(
        status_code=404,
        detail="Player not cached yet. Fetch scheduled."
    )

def build_player_summary(player_id: int):
    cached = player_cache.find_one({"player_id": player_id})

    if not cached:
        raise HTTPException(status_code=404, detail="Player not cached")

    # If already formatted summary exists
    if "summary" in cached:
        return cached["summary"]

    # Otherwise build summary from legacy "data"
    if "data" not in cached:
        raise HTTPException(status_code=404, detail="Invalid cache format")

    data = cached["data"]

    career_stats = pd.DataFrame(data["career_stats"])
    game_log = pd.DataFrame(data["game_log"])

    career_stats = career_stats[career_stats["GP"] > 0]
    career_stats = career_stats.sort_values("SEASON_ID", ascending=False)

    latest = career_stats.iloc[0]

    # -------------------------
    # Base season stats
    # -------------------------
    season_stats = {
        "gp": int(latest["GP"]),
        "min_total": float(latest["MIN"]),
        "pts": float(latest["PTS"]),
        "ast": float(latest["AST"]),
        "reb": float(latest["REB"]),
        "stl": float(latest["STL"]),
        "blk": float(latest["BLK"]),
        "tov": float(latest["TOV"]),

        "fgm": float(latest["FGM"]),
        "fga": float(latest["FGA"]),
        "fg_pct": float(latest["FG_PCT"]),

        "three_pm": float(latest["FG3M"]),
        "three_pa": float(latest["FG3A"]),
        "fg3_pct": float(latest["FG3_PCT"]),

        "ftm": float(latest["FTM"]),
        "fta": float(latest["FTA"]),
        "ft_pct": float(latest["FT_PCT"]),
    }

    # -------------------------
    # Advanced metrics
    # -------------------------
    if latest["FGA"] > 0:
        efg = (latest["FGM"] + 0.5 * latest["FG3M"]) / latest["FGA"]
    else:
        efg = 0.0

    tsa = latest["FGA"] + 0.44 * latest["FTA"]
    if tsa > 0:
        ts = latest["PTS"] / (2 * tsa)
    else:
        ts = 0.0

    season_stats["efg_pct"] = round(efg, 3)
    season_stats["ts_pct"] = round(ts, 3)

    season_stats["fg2pm"] = float(latest["FGM"]) - float(latest["FG3M"])
    season_stats["fg2pa"] = float(latest["FGA"]) - float(latest["FG3A"])

    # -------------------------
    # Final summary
    # -------------------------
    summary = {
        "player_id": int(player_id),
        "name": data["name"],
        "season": str(latest["SEASON_ID"]),
        "season_stats": season_stats,
        "last_game": None,
        "headshot_url": f"https://cdn.nba.com/headshots/nba/latest/1040x760/{player_id}.png"
    }

    return summary
