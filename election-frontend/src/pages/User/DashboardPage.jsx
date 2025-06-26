"use client"
import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { electionsAPI } from "../../services/api"
import Card from "../../components/UI/Card"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import { Vote, Calendar, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react"

function DashboardPage() {
  const { user } = useAuth()

  const { data: elections, isLoading: electionsLoading } = useQuery("active-elections", electionsAPI.getActive)

  const activeElections = elections?.data?.elections || []

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Selamat Datang, {user?.fullName}!</h1>
        <p className="text-primary-100">
          Gunakan hak pilih Anda dengan bijak dalam sistem pemilihan digital yang aman dan terpercaya.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Content className="flex items-center p-6">
            <div className="flex-shrink-0">
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  user?.isVerified ? "bg-green-100" : "bg-yellow-100"
                }`}
              >
                {user?.isVerified ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-600" />
                )}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status Verifikasi</p>
              <p className={`text-lg font-semibold ${user?.isVerified ? "text-green-600" : "text-yellow-600"}`}>
                {user?.isVerified ? "Terverifikasi" : "Menunggu Verifikasi"}
              </p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex items-center p-6">
            <div className="flex-shrink-0">
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  user?.hasVoted ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <Vote className={`h-6 w-6 ${user?.hasVoted ? "text-blue-600" : "text-gray-400"}`} />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status Voting</p>
              <p className={`text-lg font-semibold ${user?.hasVoted ? "text-blue-600" : "text-gray-600"}`}>
                {user?.hasVoted ? "Sudah Memilih" : "Belum Memilih"}
              </p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex items-center p-6">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pemilihan Aktif</p>
              <p className="text-lg font-semibold text-gray-900">{activeElections.length} Pemilihan</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Verification Alert */}
      {!user?.isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Akun Belum Terverifikasi</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Akun Anda sedang dalam proses verifikasi oleh admin. Anda tidak dapat melakukan voting hingga akun
                  terverifikasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Elections */}
      <Card>
        <Card.Header>
          <Card.Title>Pemilihan Aktif</Card.Title>
          <Card.Description>Daftar pemilihan yang sedang berlangsung</Card.Description>
        </Card.Header>
        <Card.Content>
          {electionsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : activeElections.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada pemilihan aktif saat ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeElections.map((election) => (
                <div
                  key={election.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{election.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{election.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(election.startDate).toLocaleDateString("id-ID")} -{" "}
                          {new Date(election.endDate).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {user?.isVerified ? (
                        <Link to={`/vote/${election.id}`} className="btn-primary">
                          Pilih Sekarang
                        </Link>
                      ) : (
                        <button disabled className="btn-primary opacity-50 cursor-not-allowed">
                          Menunggu Verifikasi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Lihat Hasil Pemilihan</h3>
                <p className="text-sm text-gray-500 mt-1">Pantau hasil pemilihan yang telah selesai</p>
                <Link
                  to="/results"
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium mt-2 inline-block"
                >
                  Lihat Hasil →
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Vote className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Riwayat Voting</h3>
                <p className="text-sm text-gray-500 mt-1">Lihat riwayat partisipasi Anda dalam pemilihan</p>
                <Link
                  to="/vote-history"
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium mt-2 inline-block"
                >
                  Lihat Riwayat →
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
