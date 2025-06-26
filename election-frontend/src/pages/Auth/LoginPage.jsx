"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useAuth } from "../../context/AuthContext"
import { Eye, EyeOff, Vote } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || "/dashboard"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    const result = await login(data)
    if (result.success) {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Vote className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Masuk ke Akun Anda</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Atau{" "}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              daftar akun baru
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
                placeholder="Masukkan email Anda"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("password", {
                    required: "Password wajib diisi",
                  })}
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Masukkan password Anda"
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
          </div>

          <div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
              Lupa password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
