"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Layout from "./components/Layout/Layout"
import ProtectedRoute from "./components/Auth/ProtectedRoute"
import AdminRoute from "./components/Auth/AdminRoute"

// Auth Pages
import LoginPage from "./pages/Auth/LoginPage"
import RegisterPage from "./pages/Auth/RegisterPage"

// User Pages
import DashboardPage from "./pages/User/DashboardPage"
import ElectionsPage from "./pages/User/ElectionsPage"
import VotingPage from "./pages/User/VotingPage"
// import ProfilePage from "./pages/User/ProfilePage"
// import VoteHistoryPage from "./pages/User/VoteHistoryPage"

// Admin Pages
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage"
import AdminUsersPage from "./pages/Admin/AdminUsersPage"
// import AdminElectionsPage from "./pages/Admin/AdminElectionsPage"
// import AdminCandidatesPage from "./pages/Admin/AdminCandidatesPage"
// import AdminResultsPage from "./pages/Admin/AdminResultsPage"
// import AdminAnalyticsPage from "./pages/Admin/AdminAnalyticsPage"

// Public Pages
import HomePage from "./pages/Public/HomePage"
// import AboutPage from "./pages/Public/AboutPage"
// import ResultsPage from "./pages/Public/ResultsPage"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  // const user = true;
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/about" element={<AboutPage />} />
      <Route path="/results" element={<ResultsPage />} /> */}

      {/* Auth Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} /> : <RegisterPage />}
      />

      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/elections"
        element={
          <ProtectedRoute>
            <Layout>
              <ElectionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vote/:electionId"
        element={
          <ProtectedRoute>
            <Layout>
              <VotingPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      /> */}

      {/* <Route
        path="/vote-history"
        element={
          <ProtectedRoute>
            <Layout>
              <VoteHistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      /> */}

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
            <Layout isAdmin={true}>
              <AdminDashboardPage />
            </Layout>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <Layout isAdmin={true}>
              <AdminUsersPage />
            </Layout>
          </AdminRoute>
        }
      />

      {/* <Route
        path="/admin/elections"
        element={
          <AdminRoute>
            <Layout isAdmin>
              <AdminElectionsPage />
            </Layout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/candidates"
        element={
          <AdminRoute>
            <Layout isAdmin>
              <AdminCandidatesPage />
            </Layout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/results"
        element={
          <AdminRoute>
            <Layout isAdmin>
              <AdminResultsPage />
            </Layout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <Layout isAdmin>
              <AdminAnalyticsPage />
            </Layout>
          </AdminRoute>
        }
      /> */}

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Halaman tidak ditemukan</p>
              <a href="/" className="btn-primary">
                Kembali ke Beranda
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
