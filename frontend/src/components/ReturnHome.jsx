import { useNavigate } from "react-router-dom"

export default function ReturnHome({ className = "" }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate("/")}
      className={`bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition ${className}`}
    >
      ← Return Home
    </button>
  )
}
