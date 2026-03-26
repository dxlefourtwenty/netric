import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"

import ReturnHome from "../components/ReturnHome"
import { API_BASE } from "../api"

const PLAYER_SUMMARY_CACHE_TTL = 1000 * 60 * 30

function getPlayerSummaryCacheKey(playerId) {
  return `netric:player-summary:${playerId}`
}

function readPlayerSummaryCache(playerId) {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawCache = window.localStorage.getItem(getPlayerSummaryCacheKey(playerId))

    if (!rawCache) {
      return null
    }

    const parsedCache = JSON.parse(rawCache)

    if (!parsedCache?.timestamp || Date.now() - parsedCache.timestamp > PLAYER_SUMMARY_CACHE_TTL) {
      window.localStorage.removeItem(getPlayerSummaryCacheKey(playerId))
      return null
    }

    return parsedCache.data ?? null
  } catch (error) {
    console.error("Failed to read player summary cache", error)
    return null
  }
}

function writePlayerSummaryCache(playerId, summary) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(
      getPlayerSummaryCacheKey(playerId),
      JSON.stringify({
        timestamp: Date.now(),
        data: summary,
      })
    )
  } catch (error) {
    console.error("Failed to write player summary cache", error)
  }
}

export default function PlayerInfo() {
  const { id } = useParams()
  const cachedSummary = readPlayerSummaryCache(id)
  const [tab, setTab] = useState("season")
  const [data, setData] = useState(cachedSummary)
  const [loading, setLoading] = useState(() => !cachedSummary)

  useEffect(() => {
    const nextCachedSummary = readPlayerSummaryCache(id)
    let ignore = false

    setData(nextCachedSummary)
    setLoading(!nextCachedSummary)

    axios
      .get(`${API_BASE}/player/${id}/summary`)
      .then(res => {
        if (ignore) {
          return
        }

        setData(res.data)
        writePlayerSummaryCache(id, res.data)
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (ignore) {
          return
        }

        setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [id])

  if (!data || !data.season_stats)
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.18),_transparent_28%)]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
          <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl animate-fade-up">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full border-4 border-blue-400/30 border-t-blue-400 animate-spin" />
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {loading ? "Loading player profile" : "Refreshing player profile"}
            </h1>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              Pulling the latest season summary and recent game data.
            </p>
          </div>
        </div>
      </div>
    )

  function formatNumber(value, decimals = 1) {
    if (value == null || Number.isNaN(Number(value))) {
      return "0.0"
    }

    return Number(value).toFixed(decimals)
  }

  function formatStat(stat, decimals = 1) {
    if (!data?.season_stats?.gp || data.season_stats.gp === 0) {
      return "0.0"
    }

    if (stat == null || Number.isNaN(Number(stat))) {
      return "0.0"
    }

    return (Number(stat) / Number(data.season_stats.gp)).toFixed(decimals)
  }

  function formatPct(stat, decimals = 1) {
    if (stat == null || Number.isNaN(Number(stat))) {
      return "0.0"
    }

    return Number(Number(stat) * 100).toFixed(decimals)
  }

  function calculatePct(makes, attempts, decimals = 1) {
    if (!attempts || Number(attempts) === 0) {
      return "0.0"
    }

    return Number((Number(makes) / Number(attempts)) * 100).toFixed(decimals)
  }

  const primaryStats = [
    { label: "Points", value: formatStat(data.season_stats.pts), accent: "from-blue-500/30 to-cyan-400/10" },
    { label: "Assists", value: formatStat(data.season_stats.ast), accent: "from-emerald-500/30 to-teal-400/10" },
    { label: "Rebounds", value: formatStat(data.season_stats.reb), accent: "from-amber-500/30 to-orange-400/10" },
    { label: "Steals", value: formatStat(data.season_stats.stl), accent: "from-fuchsia-500/30 to-pink-400/10" },
  ]

  const seasonSections = [
    {
      title: "Scoring Output",
      description: "Per-game production across the core box score categories.",
      stats: [
        { label: "PTS", value: formatStat(data.season_stats.pts) },
        { label: "AST", value: formatStat(data.season_stats.ast) },
        { label: "REB", value: formatStat(data.season_stats.reb) },
        { label: "STL", value: formatStat(data.season_stats.stl) },
        { label: "BLK", value: formatStat(data.season_stats.blk) },
        { label: "TOV", value: formatStat(data.season_stats.tov) },
        { label: "MIN", value: formatStat(data.season_stats.min_total) },
      ],
    },
    {
      title: "Shot Making",
      description: "Per-game makes with the most relevant accuracy markers.",
      stats: [
        { label: "FGM", value: formatStat(data.season_stats.fgm) },
        { label: "2PM", value: formatStat(data.season_stats.fg2pm) },
        { label: "3PM", value: formatStat(data.season_stats.three_pm) },
        { label: "FG%", value: `${formatPct(data.season_stats.fg_pct)}%` },
        { label: "2FG%", value: `${calculatePct(data.season_stats.fg2pm, data.season_stats.fg2pa)}%` },
        { label: "3FG%", value: `${formatPct(data.season_stats.fg3_pct)}%` },
        { label: "FT%", value: `${calculatePct(data.season_stats.ftm, data.season_stats.fta)}%` },
      ],
    },
    {
      title: "Efficiency Snapshot",
      description: "A quick look at season-level efficiency and availability.",
      stats: [
        { label: "TS%", value: `${formatPct(data.season_stats.ts_pct)}%` },
        { label: "eFG%", value: `${formatPct(data.season_stats.efg_pct)}%` },
        { label: "Games", value: formatNumber(data.season_stats.gp, 0) },
      ],
    },
  ]

  const tabs = [
    { id: "season", label: "Season" },
    { id: "career", label: "Career" },
    { id: "advanced", label: "Advanced" },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_26%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(2,6,23,1))]" />
      <div className="absolute left-[-6rem] top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 right-[-5rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl animate-float-delayed" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 flex justify-end">
          <ReturnHome className="border border-white/10 bg-white/10 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15" />
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <div className="w-full max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/35 backdrop-blur-2xl animate-fade-up sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-blue-400/25 via-cyan-300/15 to-emerald-300/10 blur-xl" />
                    <img
                      src={data.headshot_url}
                      alt={data.name}
                      className="relative h-32 w-32 rounded-[1.5rem] border border-white/15 object-cover shadow-xl shadow-black/25 transition-transform duration-500 hover:scale-[1.03] sm:h-36 sm:w-36"
                    />
                  </div>

                  <div>
                    <div className="mb-3 inline-flex items-center rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-blue-200">
                      Player Overview
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      {data.name}
                    </h1>
                    <p className="mt-2 text-sm text-slate-300 sm:text-base">
                      Season {data.season} • {formatNumber(data.season_stats.gp, 0)} games played
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[29rem]">
                  {primaryStats.map(stat => (
                    <div
                      key={stat.label}
                      className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${stat.accent} p-4 shadow-lg shadow-black/15 transition-all duration-300 hover:-translate-y-1 hover:border-white/20`}
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-300">{stat.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-white transition-transform duration-300 group-hover:translate-x-1">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-2 sm:justify-start">
                {tabs.map(option => {
                  const isActive = tab === option.id

                  return (
                    <button
                      key={option.id}
                      onClick={() => setTab(option.id)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-white text-slate-950 shadow-lg shadow-white/10"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>

              <div key={tab} className="animate-content-in">
                {tab === "season" && (
                  <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
                    <div className="grid gap-5">
                      {seasonSections.map(section => (
                        <div
                          key={section.title}
                          className="rounded-[1.5rem] border border-white/10 bg-slate-900/55 p-5 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
                        >
                          <div className="mb-5">
                            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                            <p className="mt-1 text-sm text-slate-400">{section.description}</p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {section.stats.map(stat => (
                              <div
                                key={stat.label}
                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors duration-300 hover:bg-white/10"
                              >
                                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{stat.label}</p>
                                <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-5">
                      <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-blue-500/12 via-slate-900/75 to-emerald-400/10 p-5 shadow-lg shadow-black/20">
                        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Season Focus</p>
                        <h2 className="mt-3 text-2xl font-semibold text-white">
                          {formatStat(data.season_stats.pts)} / {formatStat(data.season_stats.ast)} / {formatStat(data.season_stats.reb)}
                        </h2>
                        <p className="mt-2 text-sm text-slate-300">
                          A compact scoring, playmaking, and rebounding snapshot for the current season.
                        </p>
                      </div>

                      {data.last_game ? (
                        <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/60 p-5 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-white/15">
                          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Last Game</p>
                          <h2 className="mt-3 text-xl font-semibold text-white">{data.last_game.matchup}</h2>
                          <p className="mt-1 text-sm text-slate-400">{data.last_game.date}</p>

                          <div className="mt-5 grid grid-cols-3 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">PTS</p>
                              <p className="mt-2 text-xl font-semibold text-white">{formatNumber(data.last_game.pts, 0)}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AST</p>
                              <p className="mt-2 text-xl font-semibold text-white">{formatNumber(data.last_game.ast, 0)}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">REB</p>
                              <p className="mt-2 text-xl font-semibold text-white">{formatNumber(data.last_game.reb, 0)}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-slate-900/40 p-5 text-sm text-slate-400">
                          Recent game data is not available for this player yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {tab === "career" && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/55 p-8 text-center shadow-lg shadow-black/20">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Career</p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">Career view coming next</h2>
                    <p className="mt-3 text-sm text-slate-300">
                      The layout is ready for career totals and multi-season trends once that data is wired in.
                    </p>
                  </div>
                )}

                {tab === "advanced" && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/55 p-8 text-center shadow-lg shadow-black/20">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Advanced</p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">Advanced metrics placeholder</h2>
                    <p className="mt-3 text-sm text-slate-300">
                      This section can hold usage, rate stats, and comparison visuals once the API returns them.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
