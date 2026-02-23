import { useState } from "react"
import axios from "axios"
import PlayerCard from "../components/PlayerCard"
import ReturnHome from "../components/ReturnHome"

export default function PlayerSearch() {
  const [name, setName] = useState("")
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState("players")

  const API_BASE = import.meta.env.VITE_API_BASE

  const searchPlayer = async () => {
    if (!name.trim()) return

    try {
      setLoading(true)
      setError(null)
      setStats(null)

      const encodedName = encodeURIComponent(name.trim())

      const res = await axios.get(
        `${API_BASE}/search/${category}/${encodedName}`
      )

      setStats(res.data)
    } catch (err) {
      setError("Player not found or server error.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative p-8 bg-gray-900 min-h-screen text-white">
     
      <div className="absolute top-6 right-8">
        <ReturnHome />
      </div>

      <div className="flex justify-between items-center">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-gray-800 p-2 rounded mb-12"
        >
          <option value="players">Players</option>
          <option value="teams">Teams</option>
          <option value="stats">Stats</option>
        </select>
      </div>
      <h1 className="text-3xl font-bold mb-6">Search {category}</h1>

      <div className="flex gap-4">
        <input
          className="p-2 rounded bg-gray-800 border border-gray-700"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchPlayer();
            }
          }}
          placeholder="Enter player name"
        />

        <button
          onClick={searchPlayer}
          disabled={loading}
          className={`px-4 py-2 rounded ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {loading && (
        <div className="mt-6">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && <p className="mt-6 text-red-500">{error}</p>}

      {stats && !loading && <PlayerCard {...stats} />}
    </div>
  )
}
