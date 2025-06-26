export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }

  return new Date(dateString).toLocaleDateString("id-ID", defaultOptions)
}

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

export const validateNIK = (nik) => {
  return /^\d{16}$/.test(nik)
}

export const validatePhone = (phone) => {
  return /^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(phone)
}

export const validateEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email)
}

export const getElectionStatus = (startDate, endDate) => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now < start) return "upcoming"
  if (now > end) return "completed"
  return "active"
}

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0
  return ((value / total) * 100).toFixed(2)
}

export const generateVoteHash = (userId, candidateId, electionId) => {
  const timestamp = Date.now()
  const data = `${userId}-${candidateId}-${electionId}-${timestamp}`

  // Simple hash function (in production, use crypto library)
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ")
}
