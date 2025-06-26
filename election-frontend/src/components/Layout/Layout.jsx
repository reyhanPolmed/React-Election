"use client"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import { useAuth } from "../../context/AuthContext"

// eslint-disable-next-line react/prop-types
function Layout({ children, isAdmin = true }) {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout
