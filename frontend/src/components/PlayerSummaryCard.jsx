import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function PlayerSummaryCard({ player }) {
  const [summary, setSummary] = useState(null)
  const navigate = useNavigate()

  const API_BASE = import.meta.env.VITE_API_BASE  

  useEffect(() => {
    axios
      .get(`${API_BASE}/player/${player.id}/summary`)
      .then(res => setSummary(res.data))
      .catch(err => console.error(err))
  }, [player.id])

  if (!summary) {
    return (
      <div className="bg-gray-700 p-4 rounded mb-3">
        Loading {player.name}...
      </div>
    )
  }

  function formatStat(stat, decimals = 1) {
    if (stat == null || stat == undefined || isNaN(stat)) {
      return "0.0"
    }

    return Number(Number(stat) / Number(summary.season_stats.gp)).toFixed(decimals);
  }

  function formatPct(stat, decimals = 1) {
    return Number(Number(stat) * 100).toFixed(decimals);
  }

  function calculatePct(makes, attempts, decimals = 1) {
    return Number((Number(makes) / Number(attempts)) * 100).toFixed(decimals);
  }

  const token = localStorage.getItem("token")

  async function removeFavorite(e) {
    e.stopPropagation() // prevent navigation

    try {
      await axios.delete(
        `http://127.0.0.1:8000/favorites/player/${player.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      // simplest way: refresh page
      window.location.reload()

    } catch (err) {
      console.error("Failed to remove favorite", err)
    }
  }

  return (
    <div
      onClick={() => navigate(`/player/${player.id}`)}
      className="relative bg-gray-700 p-4 rounded mb-3 cursor-pointer min-w-[550px] hover:bg-gray-600 transition"
    >
      <button
        onClick={removeFavorite}
        className="absolute cursor-pointer top-2 right-2 bg-red-600 hover:font-bold hover:bg-red-500 hover:outline-2 hover:border-white text-sm px-2 py-1 rounded"
      >
        X
      </button>

      <div className="flex flex-row justify-between mx-2 items-center">
        <div className="flex flex-col items-center gap-5">
          <h2 className="font-semibold text-xl">{player.name}</h2>
          <img src={summary.headshot_url} className="w-45 h-33"/>
        </div>
        <div className="flex flex-col mt-2 text-lg items-center">
          <p>{summary.season} Season Stats</p>
          <div className="flex flex-row gap-5">
            <p>PTS: {formatStat(summary.season_stats.pts)}</p>
            <p>AST: {formatStat(summary.season_stats.ast)}</p>
            <p>REB: {formatStat(summary.season_stats.reb)}</p>
            <p>STL: {formatStat(summary.season_stats.stl)}</p>
          </div>
          <div className="flex flex-row gap-5">
            <p>BLK: {formatStat(summary.season_stats.blk)}</p>
            <p>TOV: {formatStat(summary.season_stats.tov)}</p>
            <p>MIN: {formatStat(summary.season_stats.min_total)}</p>
          </div>
          <div className="flex flex-row gap-5">
            <p>FGM: {formatStat(summary.season_stats.fgm)}</p>
            <p>2PM: {formatStat(summary.season_stats.fg2pm)}</p>
            <p>3PM: {formatStat(summary.season_stats.three_pm)}</p>
          </div>
          <div className="flex flex-row gap-5">
            <p>FG%: {formatPct(summary.season_stats.fg_pct)}</p>
            <p>2FG%: {calculatePct(summary.season_stats.fg2pm, summary.season_stats.fg2pa, 1)}</p>
            <p>3FG%: {formatPct(summary.season_stats.fg3_pct)}</p>
          </div>
          <div className="flex flex-row gap-5">
            <p>FT%: {calculatePct(summary.season_stats.ftm, summary.season_stats.fta, 1)}</p>
            <p>TS%: {formatPct(summary.season_stats.ts_pct)}</p>
            <p>EFG%: {formatPct(summary.season_stats.efg_pct)}</p>
          </div>

          {summary.last_game && (
            <div className="flex flex-col mt-3 text-xs text-gray-300 items-center">
              <p>Last Game:</p>
              <p>{summary.last_game.matchup} ({summary.last_game.date})</p>
              <p>
                {summary.last_game.pts} PTS / {summary.last_game.ast} AST / {summary.last_game.reb} REB
              </p>
            </div>
          )}
        </div>
      </div>

      
    </div>
  )
}
