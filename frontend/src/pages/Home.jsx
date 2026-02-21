export default function Home() {
  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold">Netric Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          Favorite Players (coming soon)
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          Team Leaders (coming soon)
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          League Stat Leaders (coming soon)
        </div>
      </div>
    </div>
  )
}
