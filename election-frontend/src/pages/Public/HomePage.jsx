"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Vote, Shield, Users, BarChart3, CheckCircle, ArrowRight, Lock, Globe } from "lucide-react"

function HomePage() {
  const { user } = useAuth()

  const features = [
    {
      icon: Shield,
      title: "Keamanan Terjamin",
      description: "Sistem enkripsi tingkat tinggi melindungi setiap suara yang diberikan",
    },
    {
      icon: Users,
      title: "Transparan",
      description: "Proses pemilihan yang terbuka dan dapat diverifikasi oleh semua pihak",
    },
    {
      icon: BarChart3,
      title: "Real-time Results",
      description: "Pantau hasil pemilihan secara langsung dengan update real-time",
    },
    {
      icon: Globe,
      title: "Aksesibilitas",
      description: "Dapat diakses dari mana saja, kapan saja selama periode pemilihan",
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Daftar Akun",
      description: "Buat akun dengan data diri yang valid dan lengkap",
    },
    {
      number: "02",
      title: "Verifikasi",
      description: "Tunggu proses verifikasi dari admin sistem",
    },
    {
      number: "03",
      title: "Pilih Kandidat",
      description: "Berikan suara untuk kandidat pilihan Anda",
    },
    {
      number: "04",
      title: "Lihat Hasil",
      description: "Pantau hasil pemilihan secara real-time",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Vote className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">Pemilu Digital</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Tentang
              </Link>
              <Link to="/results" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Hasil
              </Link>
              {user ? (
                <Link to="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login" className="btn-outline">
                    Masuk
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sistem Pemilihan Umum
              <span className="block text-primary-200">Digital Indonesia</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Platform pemilihan digital yang aman, transparan, dan mudah digunakan untuk mendukung demokrasi Indonesia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user && (
                <Link
                  to="/register"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg transition-colors inline-flex items-center justify-center"
                >
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
              <Link
                to="/about"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-md font-semibold text-lg transition-colors inline-flex items-center justify-center"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Mengapa Memilih Platform Kami?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Teknologi terdepan untuk pemilihan yang aman, transparan, dan dapat dipercaya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cara Kerja Platform</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Proses sederhana dalam 4 langkah untuk berpartisipasi dalam pemilihan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-gray-300 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Keamanan & Privasi Terjamin</h2>
              <p className="text-xl text-gray-300 mb-8">
                Sistem kami menggunakan teknologi enkripsi tingkat militer dan blockchain untuk memastikan setiap suara
                aman dan tidak dapat dimanipulasi.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span>Enkripsi end-to-end untuk semua data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span>Verifikasi identitas berlapis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span>Audit trail yang dapat diverifikasi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span>Perlindungan dari serangan siber</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-800 rounded-lg p-8">
                <Lock className="h-24 w-24 text-primary-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">256-bit Encryption</h3>
                <p className="text-gray-300">
                  Standar keamanan internasional yang sama dengan yang digunakan oleh bank dan institusi keuangan
                  global.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap Berpartisipasi dalam Demokrasi Digital?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan warga negara lainnya yang telah mempercayakan suara mereka pada platform kami.
            </p>
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-md font-semibold text-lg transition-colors inline-flex items-center"
            >
              Daftar Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Vote className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold">Pemilu Digital</span>
              </div>
              <p className="text-gray-300 mb-4">
                Platform pemilihan umum digital yang aman, transparan, dan dapat dipercaya untuk mendukung demokrasi
                Indonesia.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Tautan</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-white">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link to="/results" className="text-gray-300 hover:text-white">
                    Hasil Pemilihan
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-gray-300 hover:text-white">
                    Bantuan
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-300 hover:text-white">
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-white">
                    Syarat & Ketentuan
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2024 Pemilu Digital Indonesia. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
