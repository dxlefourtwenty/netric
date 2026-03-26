import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE } from "../api"

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async e => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      await axios.post(`${API_BASE}/register`, { email, password })

      navigate("/login")
    } catch {
      setError("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.16),_transparent_24%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(2,6,23,1))]" />
      <div className="absolute left-[-6rem] top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl animate-float-slow" />
      <div className="absolute bottom-6 right-[-5rem] h-72 w-72 rounded-full bg-amber-400/10 blur-3xl animate-float-delayed" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/35 backdrop-blur-2xl animate-fade-up lg:grid-cols-[0.98fr_1.02fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <div className="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-amber-100">
                  New Account
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Register
                </h2>
                <p className="mt-2 text-sm text-slate-300 sm:text-base">
                  Create an account to save players, return faster with favorites, and keep your dashboard personalized.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-slate-400 focus:border-amber-200/50"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-slate-400 focus:border-amber-200/50"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 animate-content-in">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 ${
                    loading
                      ? "cursor-not-allowed bg-white/10 text-slate-400"
                      : "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 hover:-translate-y-0.5 hover:bg-amber-300"
                  }`}
                >
                  {loading ? "Creating account..." : "Register"}
                </button>
              </form>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-5 py-4">
                <p className="text-sm text-slate-300">
                  Already have an account?
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-2 text-sm font-medium text-amber-200 transition-colors duration-300 hover:text-white"
                >
                  Sign in instead
                </button>
              </div>
            </div>
          </div>

          <div className="relative hidden overflow-hidden border-l border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/12 via-transparent to-blue-500/10" />

            <div className="relative">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-300">
                Build Your Board
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white">
                Save players, track favorites, and keep the dashboard ready.
              </h1>
              <p className="mt-4 max-w-md text-base text-slate-300">
                Once registered, you can favorite players from search, return to a cached home dashboard, and drill into the refreshed profile views.
              </p>
            </div>

            <div className="relative grid gap-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Faster Returns</p>
                <p className="mt-3 text-sm text-slate-200">
                  Favorite data and player summaries are stored locally so repeat visits don&apos;t feel empty while the API refetches.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Cleaner Experience</p>
                <p className="mt-3 text-sm text-slate-200">
                  The auth flow now matches the rest of the app with the same glass treatment and upward reveal motion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
