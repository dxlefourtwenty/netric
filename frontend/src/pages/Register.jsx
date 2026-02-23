import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Register() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  const API_BASE = import.meta.env.VITE_API_BASE

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      await axios.post(
        `${API_BASE}/register`,
        { email, password }
      )

      navigate("/login")
    } catch {
      setError("Registration failed")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-8 rounded-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6">Register</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 rounded bg-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 rounded bg-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 p-2 rounded hover:bg-green-500"
        >
          Register
        </button>
      </form>
    </div>
  )
}
