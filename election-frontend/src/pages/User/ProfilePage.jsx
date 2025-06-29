"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAuth } from "../../context/AuthContext"
import Card from "../../components/UI/Card"
import Modal from "../../components/UI/Modal"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import { User, Edit, Lock, Calendar, Phone, Mail, MapPin, CreditCard, Shield } from "lucide-react"

function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      address: user?.address || "",
      phone: user?.phone || "",
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm()

  const newPassword = watch("newPassword")

  const onUpdateProfile = async (data) => {
    setLoading(true)
    const result = await updateProfile(data)
    if (result.success) {
      setShowEditModal(false)
      resetProfile()
    }
    setLoading(false)
  }

  const onChangePassword = async (data) => {
    setLoading(true)
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    if (result.success) {
      setShowPasswordModal(false)
      resetPassword()
    }
    setLoading(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Saya</h1>
          <p className="text-gray-600 mt-1">Kelola informasi personal Anda</p>
        </div>
        <button onClick={() => setShowEditModal(true)} className="btn-primary flex items-center">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <Card.Content className="p-6 text-center">
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{user?.fullName}</h3>
              <p className="text-gray-600 mb-4">{user?.email}</p>

              <div className="flex items-center justify-center space-x-4 mb-4">
                <div
                  className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    user?.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  {user?.isVerified ? "Terverifikasi" : "Belum Terverifikasi"}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>Bergabung sejak</p>
                <p className="font-medium">{formatDate(user?.createdAt)}</p>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <Card.Header>
              <Card.Title>Informasi Personal</Card.Title>
              <Card.Description>Data pribadi yang terdaftar dalam sistem</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nomor Telepon</p>
                    <p className="text-gray-900">{user?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">NIK</p>
                    <p className="text-gray-900">{user?.nik}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tanggal Lahir</p>
                    <p className="text-gray-900">{formatDate(user?.dateOfBirth)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Alamat</p>
                    <p className="text-gray-900">{user?.address}</p>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Account Security */}
          <Card>
            <Card.Header>
              <Card.Title>Keamanan Akun</Card.Title>
              <Card.Description>Kelola keamanan dan akses akun Anda</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-500">
                        Terakhir diubah: {user?.updatedAt ? formatDate(user.updatedAt) : "Tidak diketahui"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowPasswordModal(true)} className="btn-outline">
                    Ubah Password
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Login Terakhir</p>
                      <p className="text-sm text-gray-500">
                        {user?.lastLogin ? formatDate(user.lastLogin) : "Belum pernah login"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile" size="md">
        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              {...registerProfile("fullName", {
                required: "Nama lengkap wajib diisi",
                minLength: { value: 2, message: "Nama minimal 2 karakter" },
              })}
              className="input"
              placeholder="Masukkan nama lengkap"
            />
            {profileErrors.fullName && <p className="mt-1 text-sm text-red-600">{profileErrors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input
              {...registerProfile("phone", {
                required: "Nomor telepon wajib diisi",
                pattern: {
                  value: /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
                  message: "Format nomor telepon tidak valid",
                },
              })}
              className="input"
              placeholder="Contoh: 081234567890"
            />
            {profileErrors.phone && <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea
              {...registerProfile("address", {
                required: "Alamat wajib diisi",
                minLength: { value: 10, message: "Alamat minimal 10 karakter" },
              })}
              rows={3}
              className="input"
              placeholder="Masukkan alamat lengkap"
            />
            {profileErrors.address && <p className="mt-1 text-sm text-red-600">{profileErrors.address.message}</p>}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="btn-outline flex-1"
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? (
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

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Ubah Password" size="md">
        <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
            <input
              {...registerPassword("currentPassword", {
                required: "Password saat ini wajib diisi",
              })}
              type="password"
              className="input"
              placeholder="Masukkan password saat ini"
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <input
              {...registerPassword("newPassword", {
                required: "Password baru wajib diisi",
                minLength: { value: 6, message: "Password minimal 6 karakter" },
              })}
              type="password"
              className="input"
              placeholder="Masukkan password baru"
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
            <input
              {...registerPassword("confirmPassword", {
                required: "Konfirmasi password wajib diisi",
                validate: (value) => value === newPassword || "Password tidak cocok",
              })}
              type="password"
              className="input"
              placeholder="Ulangi password baru"
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="btn-outline flex-1"
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Mengubah...
                </>
              ) : (
                "Ubah Password"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProfilePage
