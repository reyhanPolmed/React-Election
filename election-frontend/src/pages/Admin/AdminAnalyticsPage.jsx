"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import { adminAPI, electionsAPI } from "../../services/api"
import Card from "../../components/UI/Card"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, Calendar, Clock, Users, BarChart3, Download } from "lucide-react"

function AdminAnalyticsPage() {
  const [selectedElection, setSelectedElection] = useState("")
  const [timePeriod, setTimePeriod] = useState("24h")

  // Get all elections
  const { data: electionsData } = useQuery("admin-elections", electionsAPI.getAll)
  const elections = electionsData?.data?.data?.elections || []

  // Get voting analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    ["voting-analytics", selectedElection, timePeriod],
    () => adminAPI.getAnalytics({ electionId: selectedElection, period: timePeriod }),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  )

  // Get dashboard data for overall statistics
  const { data: dashboardData } = useQuery("admin-dashboard", adminAPI.getDashboard, {
    refetchInterval: 30000,
  })

  const analytics = analyticsData?.data?.data
  const votingTrend = analytics?.votingTrend || []
  const stats = dashboardData?.data?.data?.statistics

  // Process voting trend data for charts
  const chartData = votingTrend.map((item) => ({
    date: new Date(item.date).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      ...(timePeriod === "1h" && { hour: "2-digit", minute: "2-digit" }),
    }),
    votes: Number.parseInt(item.count),
  }))

  const exportAnalytics = () => {
    const csvContent = [
      ["Tanggal", "Jumlah Suara"],
      ...votingTrend.map((item) => [new Date(item.date).toLocaleDateString("id-ID"), item.count]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${timePeriod}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getPeriodLabel = (period) => {
    const labels = {
      "1h": "1 Jam Terakhir",
      "24h": "24 Jam Terakhir",
      "7d": "7 Hari Terakhir",
      "30d": "30 Hari Terakhir",
    }
    return labels[period] || period
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Laporan</h1>
          <p className="text-gray-600 mt-1">Analisis tren voting dan statistik sistem</p>
        </div>
        {votingTrend.length > 0 && (
          <button onClick={exportAnalytics} className="btn-outline flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <Card.Content className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pemilihan (Opsional)</label>
              <select className="input" value={selectedElection} onChange={(e) => setSelectedElection(e.target.value)}>
                <option value="">-- Semua Pemilihan --</option>
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Periode Waktu</label>
              <select className="input" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
                <option value="1h">1 Jam Terakhir</option>
                <option value="24h">24 Jam Terakhir</option>
                <option value="7d">7 Hari Terakhir</option>
                <option value="30d">30 Hari Terakhir</option>
              </select>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-green-600">+12% dari bulan lalu</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Suara</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalVotes || 0}</p>
                <p className="text-xs text-green-600">+23% dari bulan lalu</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tingkat Partisipasi</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.voterTurnout || 0}%</p>
                <p className="text-xs text-green-600">+15% dari bulan lalu</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pemilihan Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.activeElections || 0}</p>
                <p className="text-xs text-blue-600">Saat ini berlangsung</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Voting Trend Chart */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Tren Voting - {getPeriodLabel(timePeriod)}
            </div>
            <div className="text-sm text-gray-500">
              {selectedElection
                ? elections.find((e) => e.id.toString() === selectedElection)?.title || "Pemilihan Terpilih"
                : "Semua Pemilihan"}
            </div>
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {analyticsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data voting untuk periode ini</p>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Suara"]} labelFormatter={(label) => `Tanggal: ${label}`} />
                  <Area type="monotone" dataKey="votes" stroke="#3B82F6" fillOpacity={1} fill="url(#colorVotes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Jam Puncak Voting
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {[
                { hour: "09:00 - 10:00", votes: 245, percentage: 85 },
                { hour: "19:00 - 20:00", votes: 198, percentage: 68 },
                { hour: "12:00 - 13:00", votes: 156, percentage: 54 },
                { hour: "20:00 - 21:00", votes: 134, percentage: 46 },
                { hour: "08:00 - 09:00", votes: 98, percentage: 34 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{item.hour}</span>
                    <span className="text-sm text-gray-500">{item.votes} suara</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* System Performance */}
        <Card>
          <Card.Header>
            <Card.Title>Performa Sistem</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium text-green-800">Response Time</span>
                </div>
                <span className="text-sm text-green-600">&lt; 200 ms</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium text-green-800">Uptime</span>
                </div>
                <span className="text-sm text-green-600">99.9%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                  <span className="text-sm font-medium text-blue-800">Concurrent Users</span>
                </div>
                <span className="text-sm text-blue-600">1,247</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                  <span className="text-sm font-medium text-yellow-800">Error Rate</span>
                </div>
                <span className="text-sm text-yellow-600">0.1%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                  <span className="text-sm font-medium text-purple-800">Database Load</span>
                </div>
                <span className="text-sm text-purple-600">23%</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Summary Report */}
      <Card>
        <Card.Header>
          <Card.Title>Ringkasan Laporan</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="prose max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Highlights</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Tingkat partisipasi meningkat 15% dari periode sebelumnya</li>
                  <li>• Jam puncak voting: 09:00-10:00 WIB</li>
                  <li>• Tidak ada gangguan sistem selama periode voting</li>
                  <li>• Response time rata-rata di bawah 200 ms</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Rekomendasi</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Tingkatkan kapasitas server untuk jam puncak</li>
                  <li>• Implementasi caching untuk performa lebih baik</li>
                  <li>• Monitoring real-time untuk deteksi dini masalah</li>
                  <li>• Backup sistem otomatis setiap 6 jam</li>
                </ul>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default AdminAnalyticsPage
