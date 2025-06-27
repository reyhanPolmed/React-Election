"use client"
import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { electionsAPI } from "../../services/api"
import Card from "../../components/UI/Card"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import { Calendar, Clock, Users, Vote, CheckCircle, XCircle } from "lucide-react"

function ElectionsPage() {
  const { user } = useAuth()

  const { data: elections, isLoading } = useQuery("elections", electionsAPI.getAll)

  const electionsList = elections?.data?.data?.elections || []

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "Akan Datang",
      },
      active: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Aktif",
      },
      completed: {
        color: "bg-gray-100 text-gray-800",
        icon: XCircle,
        text: "Selesai",
      },
    }

    const config = statusConfig[status] || statusConfig.upcoming
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    )
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Pemilihan</h1>
          <p className="text-gray-600 mt-1">Pilih pemilihan yang ingin Anda ikuti</p>
        </div>
      </div>

      {electionsList.length === 0 ? (
        <Card>
          <Card.Content className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Pemilihan</h3>
            <p className="text-gray-500">Saat ini belum ada pemilihan yang tersedia.</p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid gap-6">
          {electionsList.map((election) => (
            <Card key={election.id} className="hover:shadow-md transition-shadow">
              <Card.Content className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{election.title}</h3>
                      {getStatusBadge(election.status)}
                    </div>

                    <p className="text-gray-600 mb-4">{election.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Mulai:</p>
                          <p>{formatDate(election.startDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Berakhir:</p>
                          <p>{formatDate(election.endDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{election.candidates?.length || 0} Kandidat</span>
                      </div>
                      <div className="flex items-center">
                        <Vote className="h-4 w-4 mr-1" />
                        <span>Max {election.maxVotesPerUser} Pilihan</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    {election.status === "active" && user?.isVerified ? (
                      <Link to={`/vote/${election.id}`} className="btn-primary">
                        Pilih Sekarang
                      </Link>
                    ) : election.status === "active" && !user?.isVerified ? (
                      <button
                        disabled
                        className="btn-primary opacity-50 cursor-not-allowed"
                        title="Akun belum terverifikasi"
                      >
                        Menunggu Verifikasi
                      </button>
                    ) : election.status === "completed" ? (
                      <Link to={`/results?election=${election.id}`} className="btn-outline">
                        Lihat Hasil
                      </Link>
                    ) : (
                      <button disabled className="btn-outline opacity-50 cursor-not-allowed">
                        Belum Dimulai
                      </button>
                    )}

                    <Link to={`/elections/${election.id}/candidates`} className="btn-outline text-center">
                      Lihat Kandidat
                    </Link>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ElectionsPage
