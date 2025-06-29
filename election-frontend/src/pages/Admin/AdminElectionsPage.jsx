/* eslint-disable no-unused-vars */
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { electionsAPI } from "../../services/api"
import Card from "../../components/UI/Card"
import Modal from "../../components/UI/Modal"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Calendar, Plus, Edit, Eye, Users, Clock, CheckCircle, XCircle, Play, Square } from "lucide-react"

function AdminElectionsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedElection, setSelectedElection] = useState(null)
  const queryClient = useQueryClient()

  const { data: electionsData, isLoading } = useQuery("admin-elections", electionsAPI.getAllAdmin)

  const createElectionMutation = useMutation(electionsAPI.create, {
    onSuccess: () => {
      toast.success("Pemilihan berhasil dibuat!")
      queryClient.invalidateQueries("admin-elections")
      setShowCreateModal(false)
      reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal membuat pemilihan")
    },
  })

  const updateStatusMutation = useMutation(({ id, status }) => electionsAPI.updateStatus(id, status), {
    onSuccess: () => {
      toast.success("Status pemilihan berhasil diubah!")
      queryClient.invalidateQueries("admin-elections")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal mengubah status")
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const elections = electionsData?.data?.data?.elections || []

  const onCreateElection = (data) => {
    createElectionMutation.mutate(data)
  }

  const handleStatusChange = (election, newStatus) => {
    if (window.confirm(`Apakah Anda yakin ingin mengubah status menjadi "${newStatus}"?`)) {
      updateStatusMutation.mutate({ id: election.id, status: newStatus })
    }
  }

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pemilihan</h1>
          <p className="text-gray-600 mt-1">Kelola semua pemilihan dalam sistem</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Buat Pemilihan
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Pemilihan</p>
                <p className="text-2xl font-semibold text-gray-900">{elections.length}</p>
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
                <p className="text-sm font-medium text-gray-500">Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {elections.filter((e) => e.status === "active").length}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Akan Datang</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {elections.filter((e) => e.status === "upcoming").length}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Selesai</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {elections.filter((e) => e.status === "completed").length}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Elections List */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Daftar Pemilihan
          </Card.Title>
        </Card.Header>
        <Card.Content className="p-0">
          {elections.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada pemilihan dibuat</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {elections.map((election) => (
                <div key={election.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{election.title}</h3>
                        {getStatusBadge(election.status)}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{election.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Mulai: {formatDate(election.startDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Berakhir: {formatDate(election.endDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{election.candidates?.length || 0} Kandidat</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      {/* Status Control Buttons */}
                      <div className="flex space-x-2">
                        {election.status === "upcoming" && (
                          <button
                            onClick={() => handleStatusChange(election, "active")}
                            className="btn-outline text-sm flex items-center"
                            title="Aktifkan Pemilihan"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}

                        {election.status === "active" && (
                          <button
                            onClick={() => handleStatusChange(election, "completed")}
                            className="btn-outline text-sm flex items-center"
                            title="Selesaikan Pemilihan"
                          >
                            <Square className="h-4 w-4" />
                          </button>
                        )}

                        <button className="btn-outline text-sm flex items-center" title="Lihat Detail">
                          <Eye className="h-4 w-4" />
                        </button>

                        <button className="btn-outline text-sm flex items-center" title="Edit Pemilihan">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>

                      {election.status === "completed" && <button className="btn-primary text-sm">Lihat Hasil</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Create Election Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Buat Pemilihan Baru" size="lg">
        <form onSubmit={handleSubmit(onCreateElection)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Pemilihan</label>
            <input
              {...register("title", {
                required: "Judul pemilihan wajib diisi",
                minLength: { value: 3, message: "Judul minimal 3 karakter" },
              })}
              className="input"
              placeholder="Contoh: Pemilihan Presiden 2024"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              {...register("description")}
              rows={3}
              className="input"
              placeholder="Deskripsi pemilihan (opsional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Mulai</label>
              <input
                {...register("startDate", {
                  required: "Tanggal mulai wajib diisi",
                })}
                type="datetime-local"
                className="input"
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Berakhir</label>
              <input
                {...register("endDate", {
                  required: "Tanggal berakhir wajib diisi",
                })}
                type="datetime-local"
                className="input"
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maksimal Pilihan per Pengguna</label>
            <input
              {...register("maxVotesPerUser", {
                required: "Maksimal pilihan wajib diisi",
                min: { value: 1, message: "Minimal 1 pilihan" },
              })}
              type="number"
              min="1"
              defaultValue="1"
              className="input"
            />
            {errors.maxVotesPerUser && <p className="mt-1 text-sm text-red-600">{errors.maxVotesPerUser.message}</p>}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn-outline flex-1"
              disabled={createElectionMutation.isLoading}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={createElectionMutation.isLoading}>
              {createElectionMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Membuat...
                </>
              ) : (
                "Buat Pemilihan"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminElectionsPage
