import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"

import ReturnHome from "../components/ReturnHome"

export default function PlayerInfo() {
  const { id } = useParams()
  const [tab, setTab] = useState("season")
  const [data, setData] = useState(null)

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/player/${id}/summary`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
  }, [id])

  if (!data) return <div className="p-8 text-white">Loading...</div>

  return (
    <div className="relative p-8 bg-gray-900 min-h-screen text-white">

      <div className="absolute top-6 right-8">
        <ReturnHome />
      </div>

      {/* Header */}
      <div className="flex items-center gap-6">
        <img
          src={data.headshot_url}
          alt={data.name}
          className="w-32 h-32 rounded-lg object-cover"
        />
        <h1 className="text-3xl font-bold">{data.name}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6">
        <button onClick={() => setTab("season")}>Season</button>
        <button onClick={() => setTab("career")}>Career</button>
        <button onClick={() => setTab("advanced")}>Advanced</button>
      </div>

      {tab === "season" && (
        <div className="flex flex-col gap-6">
          {/* Stats */}
          <div className="space-y-2">
            <p>Season: {data.season}</p>
            <p>PTS: {data.season_stats.pts}</p>
            <p>AST: {data.season_stats.ast}</p>
            <p>REB: {data.season_stats.reb}</p>
            <p>GP: {data.season_stats.gp}</p>
          </div>

        </div>
      )}

      {tab === "career" && (
        <div>
          <p>Career tab not implemented yet</p>
        </div>
      )}

      {tab === "advanced" && (
        <div>
          <p>Advanced tab not implemented yet</p>
        </div>
      )}

    </div>
  )
}
