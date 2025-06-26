"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useAuth } from "../../context/AuthContext"
import { Eye, EyeOff, Vote } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { register: registerUser, loading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch("password")

  const onSubmit = async (data) => {
    const result = await registerUser(data)
    if (result.success) {
      navigate("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Vote className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Daftar Akun Baru</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Masuk di sini
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <input
                {...register("fullName", {
                  required: "Nama lengkap wajib diisi",
                  minLength: {
                    value: 2,
                    message: "Nama lengkap minimal 2 karakter",
                  },
                })}
                type="text"
                className="input mt-1"
                placeholder="Masukkan nama lengkap"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register("email", {
                  required: "Email wajib diisi",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Format email tidak valid",
                  },
                })}
                type="email"
                className="input mt-1"
                placeholder="Masukkan email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="nik" className="block text-sm font-medium text-gray-700">
                NIK (Nomor Induk Kependudukan)
              </label>
              <input
                {...register("nik", {
                  required: "NIK wajib diisi",
                  pattern: {
                    value: /^\d{16}$/,
                    message: "NIK harus 16 digit angka",
                  },
                })}
                type="text"
                className="input mt-1"
                placeholder="Masukkan 16 digit NIK"
                maxLength={16}
              />
              {errors.nik && <p className="mt-1 text-sm text-red-600">{errors.nik.message}</p>}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Tanggal Lahir
              </label>
              <input
                {...register("dateOfBirth", {
                  required: "Tanggal lahir wajib diisi",
                })}
                type="date"
                className="input mt-1"
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Nomor Telepon
              </label>
              <input
                {...register("phone", {
                  required: "Nomor telepon wajib diisi",
                  pattern: {
                    value: /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
                    message: "Format nomor telepon tidak valid",
                  },
                })}
                type="tel"
                className="input mt-1"
                placeholder="Contoh: 081234567890"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Alamat
              </label>
              <textarea
                {...register("address", {
                  required: "Alamat wajib diisi",
                  minLength: {
                    value: 10,
                    message: "Alamat minimal 10 karakter",
                  },
                })}
                rows={3}
                className="input mt-1"
                placeholder="Masukkan alamat lengkap"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("password", {
                    required: "Password wajib diisi",
                    minLength: {
                      value: 6,
                      message: "Password minimal 6 karakter",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <input
                {...register("confirmPassword", {
                  required: "Konfirmasi password wajib diisi",
                  validate: (value) => value === password || "Password tidak cocok",
                })}
                type="password"
                className="input mt-1"
                placeholder="Ulangi password"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Memproses...
                </>
              ) : (
                "Daftar"
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
              Syarat dan Ketentuan
            </Link>{" "}
            serta{" "}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
              Kebijakan Privasi
            </Link>{" "}
            kami.
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
