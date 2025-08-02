import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

export default function Search() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please sign in to access this page</div>
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Search YouTube Videos</h1>
        <div className="bg-white rounded-lg p-6 shadow">
          <input
            type="text"
            placeholder="Search for videos..."
            className="w-full p-3 border rounded-lg"
          />
          <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
            Search
          </button>
        </div>
      </div>
    </Layout>
  )
}

