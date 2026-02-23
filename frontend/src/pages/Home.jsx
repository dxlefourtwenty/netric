import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Home() {
  const navigate = useNavigate()
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
    .get("http://127.0.0.1:8000/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setFavorites(res.data))
    .catch((err) => {
      if (err?.response?.status === 401) navigate("/login")
      // else show an error, don’t redirect
      console.error(err)
    })

  }, [token, navigate])

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

      <div className="grid grid-cols-3 gap-6 mt-8">

        {/* Favorite Players */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Favorite Players</h2>
          {favorites.players.length === 0 ? (
            <p className="text-gray-400">No favorites yet.</p>
          ) : (
            favorites.players.map(p => (
              <div key={p.id} className="mb-2">
                {p.name}
              </div>
            ))
          )}
        </div>

        {/* Favorite Teams */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Favorite Teams</h2>
          {favorites.teams.length === 0 ? (
            <p className="text-gray-400">No favorites yet.</p>
          ) : (
            favorites.teams.map(t => (
              <div key={t.id} className="mb-2">
                {t.name}
              </div>
            ))
          )}
        </div>

        {/* Favorite Stat Categories */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Favorite Stats</h2>
          {favorites.stats.length === 0 ? (
            <p className="text-gray-400">No favorites yet.</p>
          ) : (
            favorites.stats.map((s, index) => (
              <div key={index} className="mb-2">
                {s.type}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
