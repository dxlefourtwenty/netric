import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import PlayerSummaryCard from "../components/PlayerSummaryCard"

export default function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("players")

  const API_BASE = import.meta.env.VITE_API_BASE

  const [favorites, setFavorites] = useState({
    players: [],
    teams: [],
    stats: []
  })

  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }

    axios
      .get(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFavorites(res.data))
      .catch((err) => {
        if (err?.response?.status === 401) navigate("/login")
        console.error(err)
      })

  }, [token, navigate, API_BASE])

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Netric Dashboard</h1>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/search")}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
          >
            Search
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token")
              navigate("/login")
            }}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">

        {/* Tab Buttons */}
        <div className="flex gap-4 border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("players")}
            className={`pb-2 px-2 ${
              activeTab === "players"
                ? "border-b-2 border-blue-500 text-blue-400 font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Favorite Players
          </button>

          <button
            onClick={() => setActiveTab("teams")}
            className={`pb-2 px-2 ${
              activeTab === "teams"
                ? "border-b-2 border-blue-500 text-blue-400 font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Favorite Teams
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`pb-2 px-2 ${
              activeTab === "stats"
                ? "border-b-2 border-blue-500 text-blue-400 font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Favorite Stats
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 p-6 rounded-lg">

          {activeTab === "players" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Favorite Players</h2>
              {favorites.players.length === 0 ? (
                <p className="text-gray-400">No favorites yet.</p>
              ) : (
                <div className="grid grid-cols-1 min-[900px]:grid-cols-1 min-[1300px]:grid-cols-2 min-[1800px]:grid-cols-3 gap-6">
                  {favorites.players.map(p => (
                    <PlayerSummaryCard key={p.id} player={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "teams" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Favorite Teams</h2>
              {favorites.teams.length === 0 ? (
                <p className="text-gray-400">No favorites yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.teams.map(t => (
                    <div
                      key={t.id}
                      className="bg-gray-700 p-4 rounded-lg"
                    >
                      {t.name}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "stats" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Favorite Stats</h2>
              {favorites.stats.length === 0 ? (
                <p className="text-gray-400">No favorites yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.stats.map((s, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 p-4 rounded-lg"
                    >
                      {s.type}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
