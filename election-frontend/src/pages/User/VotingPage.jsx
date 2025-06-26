"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { useAuth } from "../../context/AuthContext"
import { candidatesAPI, votesAPI, electionsAPI } from "../../services/api"
import Card from "../../components/UI/Card"
import Modal from "../../components/UI/Modal"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"
import { User, Calendar, Clock, Vote, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"

function VotingPage() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Fetch election details
  const { data: election, isLoading: electionLoading } = useQuery(["election", electionId], () =>
    electionsAPI.getById(electionId),
  )

  // Fetch candidates
  const { data: candidates, isLoading: candidatesLoading } = useQuery(["candidates", electionId], () =>
    candidatesAPI.getByElection(electionId),
  )

  // Check vote status
  const { data: voteStatus } = useQuery(["vote-status", electionId], () => votesAPI.getStatus(electionId))

  // Cast vote mutation
  const castVoteMutation = useMutation(votesAPI.cast, {
    // eslint-disable-next-line no-unused-vars
    onSuccess: (data) => {
      toast.success("Suara berhasil diberikan!")
      queryClient.invalidateQueries(["vote-status", electionId])
      queryClient.invalidateQueries("active-elections")
      setShowConfirmModal(false)
      navigate("/dashboard")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memberikan suara")
    },
  })

  const electionData = election?.data?.election
  const candidatesList = candidates?.data?.candidates || []
  const hasVoted = voteStatus?.data?.hasVoted

  const handleVote = () => {
    if (!selectedCandidate) {
      toast.error("Pilih kandidat terlebih dahulu")
      return
    }
    setShowConfirmModal(true)
  }

  const confirmVote = () => {
    castVoteMutation.mutate({
      candidateId: selectedCandidate.id,
      electionId: Number.parseInt(electionId),
    })
  }

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

  if (electionLoading || candidatesLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!electionData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pemilihan Tidak Ditemukan</h2>
        <button onClick={() => navigate("/elections")} className="btn-primary">
          Kembali ke Daftar Pemilihan
        </button>
      </div>
    )
  }

  if (hasVoted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <Card.Content className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Anda Sudah Memberikan Suara</h2>
            <p className="text-gray-600 mb-6">
              Terima kasih telah berpartisipasi dalam pemilihan `{electionData.title}``. Suara Anda telah tercatat dengan
              aman.
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p>Hash Suara: {voteStatus?.data?.voteHash}</p>
              <p>Waktu: {formatDate(voteStatus?.data?.votedAt)}</p>
            </div>
            <div className="space-x-4">
              <button onClick={() => navigate("/dashboard")} className="btn-primary">
                Kembali ke Dashboard
              </button>
              <button onClick={() => navigate("/vote-history")} className="btn-outline">
                Lihat Riwayat
              </button>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/elections")}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar Pemilihan
      </button>

      {/* Election Info */}
      <Card>
        <Card.Header>
          <Card.Title>{electionData.title}</Card.Title>
          <Card.Description>{electionData.description}</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Mulai: {formatDate(electionData.startDate)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>Berakhir: {formatDate(electionData.endDate)}</span>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Voting Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Vote className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Petunjuk Voting</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Pilih salah satu kandidat dengan mengklik kartu kandidat</li>
                <li>Pastikan pilihan Anda sudah benar sebelum konfirmasi</li>
                <li>Suara yang sudah diberikan tidak dapat diubah</li>
                <li>Proses voting akan tercatat secara anonim dan aman</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pilih Kandidat ({candidatesList.length} kandidat)</h2>

        {candidatesList.length === 0 ? (
          <Card>
            <Card.Content className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada kandidat terdaftar</p>
            </Card.Content>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidatesList.map((candidate) => (
              <Card
                key={candidate.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCandidate?.id === candidate.id
                    ? "ring-2 ring-primary-500 border-primary-500"
                    : "hover:border-primary-300"
                }`}
                onClick={() => setSelectedCandidate(candidate)}
              >
                <Card.Content className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                        {candidate.candidateNumber}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{candidate.name}</h3>
                      {candidate.party && <p className="text-sm text-gray-600 mb-2">{candidate.party}</p>}
                      {candidate.description && (
                        <p className="text-sm text-gray-500 line-clamp-3">{candidate.description}</p>
                      )}
                    </div>

                    {selectedCandidate?.id === candidate.id && (
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-primary-600" />
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Vote Button */}
      {candidatesList.length > 0 && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleVote}
            disabled={!selectedCandidate || castVoteMutation.isLoading}
            className="btn-primary px-8 py-3 text-lg"
          >
            {castVoteMutation.isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Memproses...
              </>
            ) : (
              <>
                <Vote className="h-5 w-5 mr-2" />
                Berikan Suara
              </>
            )}
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Konfirmasi Pilihan">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Perhatian!</p>
              <p className="text-sm text-yellow-700">Suara yang sudah diberikan tidak dapat diubah atau dibatalkan.</p>
            </div>
          </div>

          {selectedCandidate && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Pilihan Anda:</h4>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                  {selectedCandidate.candidateNumber}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedCandidate.name}</p>
                  {selectedCandidate.party && <p className="text-sm text-gray-600">{selectedCandidate.party}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="btn-outline flex-1"
              disabled={castVoteMutation.isLoading}
            >
              Batal
            </button>
            <button onClick={confirmVote} className="btn-primary flex-1" disabled={castVoteMutation.isLoading}>
              {castVoteMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Memproses...
                </>
              ) : (
                "Ya, Berikan Suara"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default VotingPage
