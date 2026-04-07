from datetime import datetime

import pandas as pd
from fastapi import HTTPException
from nba_api.stats.static import players

from database import db

player_cache = db["player_cache"]
fetch_queue = db["fetch_queue"]
SUMMARY_VERSION = 2


def to_int(value, default=0):
    if pd.isna(value):
        return default

    return int(float(value))


def to_float(value, default=0.0):
    if pd.isna(value):
        return default

    return float(value)


def build_efficiency_metrics(fgm, fg3m, fga, fta, pts):
    if fga > 0:
        efg = (fgm + 0.5 * fg3m) / fga
    else:
        efg = 0.0

    tsa = fga + 0.44 * fta
    if tsa > 0:
        ts = pts / (2 * tsa)
    else:
        ts = 0.0

    return round(efg, 3), round(ts, 3)


def sort_season_ids(season_ids):
    return sorted(season_ids, reverse=True)


def normalize_game_log(game_log: pd.DataFrame):
    if game_log.empty:
        return []

    prepared_log = game_log.copy()
    prepared_log["GAME_DATE"] = pd.to_datetime(prepared_log["GAME_DATE"], errors="coerce")
    prepared_log = prepared_log.sort_values("GAME_DATE", ascending=False)

    normalized_games = []

    for _, game in prepared_log.iterrows():
        pts = to_int(game.get("PTS"))
        ast = to_int(game.get("AST"))
        reb = to_int(game.get("REB"))
        fgm = to_int(game.get("FGM"))
        fg3m = to_int(game.get("FG3M"))
        fga = to_int(game.get("FGA"))
        fta = to_int(game.get("FTA"))
        ftm = to_int(game.get("FTM"))
        efg_pct, ts_pct = build_efficiency_metrics(fgm, fg3m, fga, fta, pts)

        game_date = game.get("GAME_DATE")
        formatted_date = game_date.strftime("%m/%d") if not pd.isna(game_date) else ""
        iso_date = game_date.strftime("%Y-%m-%d") if not pd.isna(game_date) else ""

        normalized_games.append(
            {
                "game_id": str(game.get("Game_ID") or game.get("GAME_ID") or ""),
                "matchup": game.get("MATCHUP", ""),
                "date": formatted_date,
                "game_date": iso_date,
                "result": game.get("WL", ""),
                "min": str(game.get("MIN", "")),
                "pts": pts,
                "ast": ast,
                "reb": reb,
                "stl": to_int(game.get("STL")),
                "blk": to_int(game.get("BLK")),
                "tov": to_int(game.get("TOV")),
                "pf": to_int(game.get("PF")),
                "plus_minus": to_int(game.get("PLUS_MINUS")),
                "fgm": fgm,
                "fga": fga,
                "fg_pct": to_float(game.get("FG_PCT")),
                "three_pm": fg3m,
                "three_pa": to_int(game.get("FG3A")),
                "fg3_pct": to_float(game.get("FG3_PCT")),
                "ftm": ftm,
                "fta": fta,
                "ft_pct": to_float(game.get("FT_PCT")),
                "efg_pct": efg_pct,
                "ts_pct": ts_pct,
            }
        )

    return normalized_games


def build_season_game_logs(career_stats: pd.DataFrame, data: dict):
    raw_logs_by_season = data.get("season_game_logs")

    if isinstance(raw_logs_by_season, dict) and raw_logs_by_season:
        normalized_logs = {}

        for season_id in sort_season_ids(raw_logs_by_season.keys()):
            normalized_logs[str(season_id)] = normalize_game_log(pd.DataFrame(raw_logs_by_season[season_id]))

        return normalized_logs

    latest_season_id = str(career_stats.iloc[0]["SEASON_ID"])
    raw_game_log = data.get("season_game_log") or data.get("game_log") or []
    return {latest_season_id: normalize_game_log(pd.DataFrame(raw_game_log))}


def build_player_summary_from_data(player_id: int, data: dict):
    if "career_stats" not in data:
        raise HTTPException(status_code=404, detail="Invalid cache format")

    career_stats = pd.DataFrame(data["career_stats"])

    if career_stats.empty:
        raise HTTPException(status_code=404, detail="Career stats unavailable")

    career_stats = career_stats[career_stats["GP"] > 0]
    career_stats = career_stats.sort_values("SEASON_ID", ascending=False)

    if career_stats.empty:
        raise HTTPException(status_code=404, detail="Season stats unavailable")

    latest = career_stats.iloc[0]
    latest_season_id = str(latest["SEASON_ID"])
    season_game_logs = build_season_game_logs(career_stats, data)
    normalized_games = season_game_logs.get(latest_season_id, [])

    season_fgm = to_float(latest["FGM"])
    season_fg3m = to_float(latest["FG3M"])
    season_fga = to_float(latest["FGA"])
    season_fta = to_float(latest["FTA"])
    season_pts = to_float(latest["PTS"])
    efg_pct, ts_pct = build_efficiency_metrics(
        season_fgm,
        season_fg3m,
        season_fga,
        season_fta,
        season_pts,
    )

    season_stats = {
        "gp": to_int(latest["GP"]),
        "min_total": to_float(latest["MIN"]),
        "pts": season_pts,
        "ast": to_float(latest["AST"]),
        "reb": to_float(latest["REB"]),
        "stl": to_float(latest["STL"]),
        "blk": to_float(latest["BLK"]),
        "tov": to_float(latest["TOV"]),
        "pf": to_float(latest["PF"]),
        "fgm": season_fgm,
        "fga": season_fga,
        "fg_pct": to_float(latest["FG_PCT"]),
        "three_pm": season_fg3m,
        "three_pa": to_float(latest["FG3A"]),
        "fg3_pct": to_float(latest["FG3_PCT"]),
        "ftm": to_float(latest["FTM"]),
        "fta": season_fta,
        "ft_pct": to_float(latest["FT_PCT"]),
        "efg_pct": efg_pct,
        "ts_pct": ts_pct,
        "fg2pm": season_fgm - season_fg3m,
        "fg2pa": season_fga - to_float(latest["FG3A"]),
    }

    last_game = normalized_games[0] if normalized_games else None

    return {
        "player_id": int(player_id),
        "summary_version": SUMMARY_VERSION,
        "name": data["name"],
        "season": latest_season_id,
        "season_stats": season_stats,
        "last_game": last_game,
        "last_5_games": normalized_games[:5],
        "season_game_log": normalized_games,
        "season_game_logs": season_game_logs,
        "available_game_log_seasons": sort_season_ids(season_game_logs.keys()),
        "headshot_url": f"https://cdn.nba.com/headshots/nba/latest/1040x760/{player_id}.png",
    }


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
    if cached.get("summary", {}).get("summary_version") == SUMMARY_VERSION:
        return cached["summary"]

    # Otherwise build summary from legacy "data"
    if "data" not in cached:
        raise HTTPException(status_code=404, detail="Invalid cache format")

    return build_player_summary_from_data(player_id, cached["data"])
