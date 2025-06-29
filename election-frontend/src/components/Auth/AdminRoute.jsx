"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

// eslint-disable-next-line react/prop-types
function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Jika user tidak ada, redirect ke login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute
