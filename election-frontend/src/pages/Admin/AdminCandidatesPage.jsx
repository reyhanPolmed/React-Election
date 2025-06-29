"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { candidatesAPI, electionsAPI } from "../../services/api"
import Card from "../../components/UI/Card"
import Modal from "../../components/UI/Modal"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Users, Plus, Edit, Trash2, Search, User, Award } from "lucide-react"

function AdminCandidatesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [selectedElection, setSelectedElection] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const queryClient = useQueryClient()

  // Get all elections for dropdown
  const { data: electionsData } = useQuery("admin-elections", electionsAPI.getAll)
  const elections = electionsData?.data?.data?.elections || []

  // Get candidates based on selected election
  const { data: candidatesData, isLoading } = useQuery(
    ["admin-candidates", selectedElection],
    () =>
      selectedElection ? candidatesAPI.getByElection(selectedElection) : Promise.resolve({ data: { candidates: [] } }),
    {
      enabled: !!selectedElection,
    },
  )

  const candidates = candidatesData?.data?.data?.candidates || []

  const createCandidateMutation = useMutation(candidatesAPI.create, {
    onSuccess: () => {
      toast.success("Kandidat berhasil dibuat!")
      queryClient.invalidateQueries(["admin-candidates", selectedElection])
      setShowCreateModal(false)
      reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal membuat kandidat")
    },
  })

  const updateCandidateMutation = useMutation(({ id, data }) => candidatesAPI.update(id, data), {
    onSuccess: () => {
      toast.success("Kandidat berhasil diperbarui!")
      queryClient.invalidateQueries(["admin-candidates", selectedElection])
      setShowEditModal(false)
      setSelectedCandidate(null)
      resetEdit()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui kandidat")
    },
  })

  const deleteCandidateMutation = useMutation(candidatesAPI.delete, {
    onSuccess: () => {
      toast.success("Kandidat berhasil dihapus!")
      queryClient.invalidateQueries(["admin-candidates", selectedElection])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus kandidat")
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    formState: { errors: editErrors },
    reset: resetEdit,
    setValue,
  } = useForm()

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.party && candidate.party.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const onCreateCandidate = (data) => {
    createCandidateMutation.mutate({
      ...data,
      electionId: Number.parseInt(selectedElection),
      candidateNumber: Number.parseInt(data.candidateNumber),
    })
  }

  const onUpdateCandidate = (data) => {
    updateCandidateMutation.mutate({
      id: selectedCandidate.id,
      data: {
        ...data,
        electionId: Number.parseInt(selectedElection),
        candidateNumber: Number.parseInt(data.candidateNumber),
      },
    })
  }

  const handleEdit = (candidate) => {
    setSelectedCandidate(candidate)
    setValue("name", candidate.name)
    setValue("party", candidate.party || "")
    setValue("description", candidate.description || "")
    setValue("candidateNumber", candidate.candidateNumber)
    setValue("photo", candidate.photo || "")
    setShowEditModal(true)
  }

  const handleDelete = (candidate) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kandidat "${candidate.name}"?`)) {
      deleteCandidateMutation.mutate(candidate.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kandidat</h1>
          <p className="text-gray-600 mt-1">Kelola kandidat untuk setiap pemilihan</p>
        </div>
        {selectedElection && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kandidat
          </button>
        )}
      </div>

      {/* Election Selector */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Pemilihan</label>
              <select className="input" value={selectedElection} onChange={(e) => setSelectedElection(e.target.value)}>
                <option value="">-- Pilih Pemilihan --</option>
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title}
                  </option>
                ))}
              </select>
            </div>
            {selectedElection && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cari Kandidat</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama atau partai..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      {selectedElection && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <Card.Content className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Kandidat</p>
                    <p className="text-2xl font-semibold text-gray-900">{candidates.length}</p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Suara</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {candidates.reduce((total, candidate) => total + (candidate.voteCount || 0), 0)}
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
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Kandidat Terdepan</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {candidates.length > 0
                        ? candidates.reduce((prev, current) =>
                            (prev.voteCount || 0) > (current.voteCount || 0) ? prev : current,
                          ).name
                        : "-"}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Candidates List */}
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Daftar Kandidat
                <span className="ml-2 text-sm font-normal text-gray-500">({filteredCandidates.length} kandidat)</span>
              </Card.Title>
            </Card.Header>
            <Card.Content className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? "Tidak ada kandidat yang sesuai dengan pencarian" : "Belum ada kandidat ditambahkan"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-600">
                              {candidate.candidateNumber}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                            {candidate.party && <p className="text-sm text-gray-600 mb-1">{candidate.party}</p>}
                            {candidate.description && (
                              <p className="text-sm text-gray-500 line-clamp-2">{candidate.description}</p>
                            )}
                            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Award className="h-4 w-4 mr-1" />
                                {candidate.voteCount || 0} suara
                              </span>
                              {candidate.photo && <span className="text-green-600">✓ Foto tersedia</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(candidate)}
                            className="btn-outline text-sm flex items-center"
                            title="Edit Kandidat"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(candidate)}
                            className="btn-outline text-sm flex items-center text-red-600 hover:text-red-700"
                            title="Hapus Kandidat"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </>
      )}

      {/* Create Candidate Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tambah Kandidat Baru" size="lg">
        <form onSubmit={handleSubmit(onCreateCandidate)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kandidat</label>
            <input
              {...register("name", {
                required: "Nama kandidat wajib diisi",
                minLength: { value: 2, message: "Nama minimal 2 karakter" },
              })}
              className="input"
              placeholder="Masukkan nama lengkap kandidat"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Urut</label>
            <input
              {...register("candidateNumber", {
                required: "Nomor urut wajib diisi",
                min: { value: 1, message: "Nomor urut minimal 1" },
              })}
              type="number"
              min="1"
              className="input"
              placeholder="Contoh: 1"
            />
            {errors.candidateNumber && <p className="mt-1 text-sm text-red-600">{errors.candidateNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Partai (Opsional)</label>
            <input {...register("party")} className="input" placeholder="Nama partai atau koalisi" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
            <textarea
              {...register("description")}
              rows={3}
              className="input"
              placeholder="Deskripsi singkat tentang kandidat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto (Opsional)</label>
            <input
              {...register("photo", {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "URL foto harus valid (dimulai dengan http:// atau https://)",
                },
              })}
              type="url"
              className="input"
              placeholder="https://example.com/photo.jpg"
            />
            {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo.message}</p>}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn-outline flex-1"
              disabled={createCandidateMutation.isLoading}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={createCandidateMutation.isLoading}>
              {createCandidateMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Menambah...
                </>
              ) : (
                "Tambah Kandidat"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Candidate Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Kandidat" size="lg">
        <form onSubmit={handleEditSubmit(onUpdateCandidate)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kandidat</label>
            <input
              {...registerEdit("name", {
                required: "Nama kandidat wajib diisi",
                minLength: { value: 2, message: "Nama minimal 2 karakter" },
              })}
              className="input"
              placeholder="Masukkan nama lengkap kandidat"
            />
            {editErrors.name && <p className="mt-1 text-sm text-red-600">{editErrors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Urut</label>
            <input
              {...registerEdit("candidateNumber", {
                required: "Nomor urut wajib diisi",
                min: { value: 1, message: "Nomor urut minimal 1" },
              })}
              type="number"
              min="1"
              className="input"
              placeholder="Contoh: 1"
            />
            {editErrors.candidateNumber && (
              <p className="mt-1 text-sm text-red-600">{editErrors.candidateNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Partai (Opsional)</label>
            <input {...registerEdit("party")} className="input" placeholder="Nama partai atau koalisi" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
            <textarea
              {...registerEdit("description")}
              rows={3}
              className="input"
              placeholder="Deskripsi singkat tentang kandidat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto (Opsional)</label>
            <input
              {...registerEdit("photo", {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "URL foto harus valid (dimulai dengan http:// atau https://)",
                },
              })}
              type="url"
              className="input"
              placeholder="https://example.com/photo.jpg"
            />
            {editErrors.photo && <p className="mt-1 text-sm text-red-600">{editErrors.photo.message}</p>}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="btn-outline flex-1"
              disabled={updateCandidateMutation.isLoading}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={updateCandidateMutation.isLoading}>
              {updateCandidateMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminCandidatesPage
