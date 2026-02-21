from nba_api.stats.endpoints import commonplayerinfo
from nba_api.stats.static import players
from nba_api.stats.library.http import NBAStatsHTTP
from nba_api.stats.endpoints import playercareerstats # all time season stats
from nba_api.stats.endpoints import playerdashboardbyyearoveryear # advanced stats

# Override headers properly
NBAStatsHTTP.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://www.nba.com/",
    "Origin": "https://www.nba.com"
})

results = players.find_players_by_full_name("Stephen Curry") 
player_id = results[0]['id']
response1 = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
df1 = response1.get_data_frames()[0]
response2 = playercareerstats.PlayerCareerStats(player_id=player_id)
df2 = response2.get_data_frames()[0]
season_df = df2[df2["SEASON_ID"] == "2024-25"]

advanced = playerdashboardbyyearoveryear.PlayerDashboardByYearOverYear(
    player_id=player_id
)

adv_df = advanced.get_data_frames()[1] # advanced data info

print(df1.tail())
print(df2.tail())
print(season_df)
print(results)
print(adv_df.tail())
