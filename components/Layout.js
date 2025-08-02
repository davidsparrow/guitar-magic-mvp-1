const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-4 py-3">
        <h1 className="text-xl font-bold text-blue-600">VideoFlip</h1>
      </header>
      <main>{children}</main>
    </div>
  )
}

export default Layout