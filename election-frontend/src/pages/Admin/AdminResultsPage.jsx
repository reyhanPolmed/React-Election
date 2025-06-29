/* eslint-disable no-unused-vars */
"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import { electionsAPI } from "../../services/api"
import Card from "../../components/UI/Card"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { BarChart3, Download, Calendar, Users, Award, TrendingUp } from "lucide-react"

function AdminResultsPage() {
  const [selectedElection, setSelectedElection] = useState("")

  // Get all elections
  const { data: electionsData } = useQuery("admin-elections", electionsAPI.getAll)
  const elections = electionsData?.data?.data?.elections || []

  // Get election results
  const { data: resultsData, isLoading: resultsLoading } = useQuery(
    ["election-results", selectedElection],
    () => electionsAPI.getResults(selectedElection),
    {
      enabled: !!selectedElection,
    },
  )

  const results = resultsData?.data?.data
  const candidates = results?.results || []
  const statistics = results?.statistics || {}

  // Colors for charts
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316", "#06B6D4", "#84CC16"]

  // Prepare chart data
  const chartData = candidates.map((candidate, index) => ({
    name: candidate.name,
    votes: candidate.voteCount,
    percentage: Number.parseFloat(candidate.percentage),
    color: COLORS[index % COLORS.length],
  }))

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportResults = () => {
    if (!results) return

    const csvContent = [
      ["Kandidat", "Nomor Urut", "Partai", "Jumlah Suara", "Persentase"],
      ...candidates.map((candidate) => [
        candidate.name,
        candidate.candidateNumber,
        candidate.party || "-",
        candidate.voteCount,
        `${candidate.percentage}%`,
      ]),
      [],
      ["Statistik"],
      ["Total Suara", statistics.totalVotes],
      ["Total Pemilih", statistics.totalEligibleVoters],
      ["Tingkat Partisipasi", `${statistics.turnout}%`],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hasil-pemilihan-${results.election.title.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hasil Pemilihan</h1>
          <p className="text-gray-600 mt-1">Lihat dan analisis hasil pemilihan</p>
        </div>
        {results && (
          <button onClick={exportResults} className="btn-outline flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {/* Election Selector */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Pemilihan</label>
              <select className="input" value={selectedElection} onChange={(e) => setSelectedElection(e.target.value)}>
                <option value="">-- Pilih Pemilihan --</option>
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title} ({election.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card.Content>
      </Card>

      {selectedElection && (
        <>
          {resultsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : results ? (
            <>
              {/* Election Info */}
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    {results.election.title}
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${
                          results.election.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : results.election.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {results.election.status === "completed"
                          ? "Selesai"
                          : results.election.status === "active"
                            ? "Aktif"
                            : "Akan Datang"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Mulai:</span>
                      <span className="ml-2">{formatDate(results.election.startDate)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Berakhir:</span>
                      <span className="ml-2">{formatDate(results.election.endDate)}</span>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <Card.Content className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Award className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Suara</p>
                        <p className="text-2xl font-semibold text-gray-900">{statistics.totalVotes}</p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Content className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Pemilih</p>
                        <p className="text-2xl font-semibold text-gray-900">{statistics.uniqueVoters}</p>
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
                        <p className="text-2xl font-semibold text-gray-900">{statistics.turnout}%</p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Content className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <Award className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Pemenang</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {candidates.length > 0 ? candidates[0].name : "-"}
                        </p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <Card>
                  <Card.Header>
                    <Card.Title className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Perolehan Suara
                    </Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name) => [value, "Suara"]}
                            labelFormatter={(label) => `Kandidat: ${label}`}
                          />
                          <Bar dataKey="votes" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Content>
                </Card>

                {/* Pie Chart */}
                <Card>
                  <Card.Header>
                    <Card.Title>Distribusi Persentase</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="votes"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [value, "Suara"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Content>
                </Card>
              </div>

              {/* Detailed Results Table */}
              <Card>
                <Card.Header>
                  <Card.Title>Hasil Detail</Card.Title>
                </Card.Header>
                <Card.Content className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Peringkat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kandidat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Partai
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jumlah Suara
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Persentase
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {candidates.map((candidate, index) => (
                          <tr key={candidate.id} className={index === 0 ? "bg-yellow-50" : ""}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span
                                  className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                                    index === 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {index + 1}
                                </span>
                                {index === 0 && <Award className="h-5 w-5 text-yellow-500 ml-2" />}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                                    {candidate.candidateNumber}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {candidate.party || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {candidate.voteCount.toLocaleString("id-ID")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${candidate.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{candidate.percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Content>
              </Card>
            </>
          ) : (
            <Card>
              <Card.Content className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada data hasil untuk pemilihan ini</p>
              </Card.Content>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default AdminResultsPage
