"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { adminAPI } from "../../services/api"
import Card from "../../components/UI/Card"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"
import { Users, Search, UserCheck, Eye, CheckCircle, XCircle, Calendar } from "lucide-react"

function AdminUsersPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [verifiedFilter, setVerifiedFilter] = useState("")
  const queryClient = useQueryClient()

  const { data: usersData, isLoading } = useQuery(
    ["admin-users", currentPage, searchTerm, verifiedFilter],
    () =>
      adminAPI.getUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        verified: verifiedFilter,
      }),
    {
      keepPreviousData: true,
    },
  )

  const verifyUserMutation = useMutation(adminAPI.verifyUser, {
    onSuccess: () => {
      toast.success("Pengguna berhasil diverifikasi!")
      queryClient.invalidateQueries(["admin-users"])
      queryClient.invalidateQueries("admin-dashboard")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memverifikasi pengguna")
    },
  })

  const users = usersData?.data?.users || []
  const pagination = usersData?.data?.pagination

  const handleVerifyUser = (userId) => {
    if (window.confirm("Apakah Anda yakin ingin memverifikasi pengguna ini?")) {
      verifyUserMutation.mutate(userId)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-600 mt-1">Kelola dan verifikasi pengguna sistem</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, email, atau NIK..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="input" value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
                <option value="">Semua Status</option>
                <option value="true">Terverifikasi</option>
                <option value="false">Belum Terverifikasi</option>
              </select>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Daftar Pengguna
            {pagination && <span className="ml-2 text-sm font-normal text-gray-500">({pagination.total} total)</span>}
          </Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada pengguna ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIK
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Terdaftar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {user.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nik}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.isVerified ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Terverifikasi
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Belum Terverifikasi
                              </>
                            )}
                          </span>
                          {user.hasVoted && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Sudah Memilih
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {!user.isVerified && (
                          <button
                            onClick={() => handleVerifyUser(user.id)}
                            disabled={verifyUserMutation.isLoading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Verifikasi Pengguna"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900" title="Lihat Detail">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} pengguna
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-outline disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-700">
              Halaman {pagination.page} dari {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="btn-outline disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
