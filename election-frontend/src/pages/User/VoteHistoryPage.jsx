"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import { useAuth } from "../../context/AuthContext"
import { votesAPI } from "../../services/api"
import Card from "../../components/UI/Card"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import { Vote, Calendar, CheckCircle, Search, Eye, Download } from "lucide-react"

function VoteHistoryPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  // Get user's voting history directly from API
  const { data: historyData, isLoading } = useQuery("user-vote-history", votesAPI.getHistory)

  const votes = historyData?.data?.data?.votes || []
  const totalVotes = historyData?.data?.data?.totalVotes || 0

  const filteredVotes = votes.filter((vote) => vote.election.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleVerifyVote = async (voteHash) => {
    try {
      const response = await votesAPI.verify(voteHash)
      if (response.data) {
        alert(
          `Vote terverifikasi!\nElection: ${response.data.election.title}\nCandidate: ${response.data.candidate.name}\nWaktu: ${formatDate(response.data.timestamp)}`,
        )
      }
    } catch (error) {
      alert("Gagal memverifikasi vote")
    }
  }

  const exportVoteHistory = () => {
    const csvContent = [
      ["Election", "Candidate", "Candidate Number", "Party", "Vote Hash", "Voted At"],
      ...votes.map((vote) => [
        vote.election.title,
        vote.candidate.name,
        vote.candidate.candidateNumber,
        vote.candidate.party || "-",
        vote.voteHash,
        formatDate(vote.createdAt),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vote-history-${user?.fullName}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Voting</h1>
          <p className="text-gray-600 mt-1">Lihat partisipasi Anda dalam pemilihan</p>
        </div>
        {totalVotes > 0 && (
          <button onClick={exportVoteHistory} className="btn-outline flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Vote className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Voting</p>
                <p className="text-2xl font-semibold text-gray-900">{totalVotes}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pemilihan Diikuti</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {[...new Set(votes.map((vote) => vote.election.title))].length}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vote Terakhir</p>
                <p className="text-sm font-semibold text-gray-900">
                  {votes.length > 0 ? new Date(votes[0].createdAt).toLocaleDateString("id-ID") : "-"}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <Card.Content className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pemilihan..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card.Content>
      </Card>

      {/* Vote History List */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            <Vote className="h-5 w-5 mr-2" />
            Riwayat Partisipasi
            <span className="ml-2 text-sm font-normal text-gray-500">({filteredVotes.length} voting)</span>
          </Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {filteredVotes.length === 0 ? (
            <div className="text-center py-12">
              <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "Tidak ada voting yang sesuai dengan pencarian" : "Belum ada riwayat voting"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredVotes.map((vote, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{vote.election.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sudah Voting
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-sm">
                            {vote.candidate.candidateNumber}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{vote.candidate.name}</p>
                            {vote.candidate.party && <p className="text-xs text-gray-500">{vote.candidate.party}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            Periode: {formatDate(vote.election.startDate)} - {formatDate(vote.election.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Vote className="h-4 w-4 mr-1" />
                          <span>Voting: {formatDate(vote.createdAt)}</span>
                        </div>
                      </div>

                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <span className="font-medium">Vote Hash:</span> {vote.voteHash}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => handleVerifyVote(vote.voteHash)}
                        className="btn-outline text-sm flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Verifikasi
                      </button>

                      {vote.election.status === "completed" && (
                        <button className="btn-outline text-sm">Lihat Hasil</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  )
}

export default VoteHistoryPage
