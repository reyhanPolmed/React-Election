import { useQuery } from "react-query"
import { adminAPI } from "../../services/api"
import Card from "../../components/UI/Card"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import { Users, Vote, Calendar, TrendingUp, UserCheck, Clock } from "lucide-react"

function AdminDashboardPage() {
  const { data: dashboardData, isLoading } = useQuery("admin-dashboard", adminAPI.getDashboard, {
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const stats = dashboardData?.data?.data?.statistics
  const recentVotes = dashboardData?.data?.data?.recentVotes || []

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Pemilihan Aktif",
      value: stats?.activeElections || 0,
      icon: Calendar,
      color: "bg-green-500",
      change: "+5%",
    },
    {
      title: "Total Suara",
      value: stats?.totalVotes || 0,
      icon: Vote,
      color: "bg-purple-500",
      change: "+23%",
    },
    {
      title: "Pengguna Terverifikasi",
      value: stats?.verifiedUsers || 0,
      icon: UserCheck,
      color: "bg-yellow-500",
      change: "+8%",
    },
    {
      title: "Total Pemilihan",
      value: stats?.totalElections || 0,
      icon: TrendingUp,
      color: "bg-indigo-500",
      change: "+3%",
    },
    {
      title: "Tingkat Partisipasi",
      value: `${stats?.voterTurnout || 0}%`,
      icon: TrendingUp,
      color: "bg-pink-500",
      change: "+15%",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Pantau aktivitas sistem pemilihan umum</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <Card.Content className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="ml-2 text-sm font-medium text-green-600">{stat.change}</p>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Votes */}
        <Card>
          <Card.Header>
            <Card.Title>Suara Terbaru</Card.Title>
            <Card.Description>10 suara terakhir yang masuk</Card.Description>
          </Card.Header>
          <Card.Content>
            {recentVotes.length === 0 ? (
              <div className="text-center py-8">
                <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada suara masuk</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentVotes.map((vote, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <Vote className="h-4 w-4 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {vote.candidate?.name} (#{vote.candidate?.candidateNumber})
                      </p>
                      <p className="text-xs text-gray-500">{vote.election?.title}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-gray-500">{new Date(vote.createdAt).toLocaleTimeString("id-ID")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* System Status */}
        <Card>
          <Card.Header>
            <Card.Title>Status Sistem</Card.Title>
            <Card.Description>Informasi status sistem saat ini</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium text-green-800">Server Status</span>
                </div>
                <span className="text-sm text-green-600">Online</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium text-green-800">Database</span>
                </div>
                <span className="text-sm text-green-600">Connected</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                  <span className="text-sm font-medium text-yellow-800">Backup Status</span>
                </div>
                <span className="text-sm text-yellow-600">Scheduled</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Last Update</span>
                </div>
                <span className="text-sm text-blue-600">{new Date().toLocaleTimeString("id-ID")}</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboardPage
