import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import PlayerSearch from "./pages/PlayerSearch"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<PlayerSearch />} />
      </Routes>
    </BrowserRouter>
  )
}
