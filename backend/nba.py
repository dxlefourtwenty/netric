import pandas as pd
from datetime import datetime
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats, playergamelog

def build_player_summary(player_id: int):
    player_info = players.find_player_by_id(player_id)
    if not player_info:
        raise Exception("Player not found")

    player_name = player_info["full_name"]

    # Career stats
    career = playercareerstats.PlayerCareerStats(
        player_id=player_id,
        timeout=30
    )
    df = career.get_data_frames()[0]

    if df.empty:
        raise Exception("No stats found")

    df = df[df["GP"] > 0]
    df = df.sort_values("SEASON_ID", ascending=False)
    latest = df.iloc[0]

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

    ts_pct = pts / (2 * (fga + 0.44 * fta)) if (fga + 0.44 * fta) > 0 else 0
    efg_pct = (fgm + 0.5 * fg3m) / fga if fga > 0 else 0

    if not cached or "data" not in cached:
        raise HTTPException(status_code=404, detail="Player not cached yet")

    # Last game
    gamelog = playergamelog.PlayerGameLog(
        player_id=player_id,
        timeout=30
    )
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

    return {
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
            "fgm": fgm,
            "fga": fga,
            "fg2pm": fg2pm,
            "fg2pa": fg2pa,
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
