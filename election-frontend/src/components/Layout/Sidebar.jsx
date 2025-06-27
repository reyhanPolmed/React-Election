"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Home, Vote, Users, BarChart3, Settings, UserCheck, Calendar, TrendingUp, History } from "lucide-react"

// eslint-disable-next-line react/prop-types
function Sidebar({ isAdmin }) {
  const location = useLocation()
  const { user } = useAuth()

  const userMenuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Pemilihan", href: "/elections", icon: Vote },
    { name: "Riwayat Voting", href: "/vote-history", icon: History },
    { name: "Profile", href: "/profile", icon: Settings },
  ]

  const adminMenuItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Pengguna", href: "/admin/users", icon: Users },
    { name: "Pemilihan", href: "/admin/elections", icon: Calendar },
    { name: "Kandidat", href: "/admin/candidates", icon: UserCheck },
    { name: "Hasil", href: "/admin/results", icon: BarChart3 },
    { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  ]

  const menuItems = isAdmin ? adminMenuItems : userMenuItems

  const isActive = (href) => {
    return location.pathname === href
  }

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200 pt-16">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">{user?.fullName?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <nav className="mt-8 flex-1 px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      isActive(item.href)
                        ? "bg-primary-100 text-primary-900 border-r-2 border-primary-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5 transition-colors
                      ${isActive(item.href) ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"}
                    `}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Status Card */}
        <div className="flex-shrink-0 p-4">
          <div className="bg-primary-50 rounded-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-2 w-2 rounded-full ${user?.isVerified ? "bg-green-400" : "bg-yellow-400"}`}></div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-primary-900">
                  Status: {user?.isVerified ? "Terverifikasi" : "Belum Terverifikasi"}
                </p>
                {!user?.isVerified && <p className="text-xs text-primary-700">Menunggu verifikasi admin</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
