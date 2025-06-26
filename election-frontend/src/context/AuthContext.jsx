"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/api"
import toast from "react-hot-toast"

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_USER":
      return { ...state, user: action.payload, loading: false, error: null }
    case "SET_TOKEN":
      return { ...state, token: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "LOGOUT":
      return { ...state, user: null, token: null, loading: false, error: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await authAPI.getProfile()
          dispatch({ type: "SET_USER", payload: response.data.user })
        } catch (error) {
          localStorage.removeItem("token")
          dispatch({ type: "LOGOUT" })
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const response = await authAPI.login(credentials)
      const { user, token } = response.data

      localStorage.setItem("token", token)
      dispatch({ type: "SET_TOKEN", payload: token })
      dispatch({ type: "SET_USER", payload: user })

      toast.success("Login berhasil!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login gagal"
      dispatch({ type: "SET_ERROR", payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const response = await authAPI.register(userData)
      const { user, token } = response.data

      localStorage.setItem("token", token)
      dispatch({ type: "SET_TOKEN", payload: token })
      dispatch({ type: "SET_USER", payload: user })

      toast.success("Registrasi berhasil!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Registrasi gagal"
      dispatch({ type: "SET_ERROR", payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    dispatch({ type: "LOGOUT" })
    toast.success("Logout berhasil!")
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      dispatch({ type: "SET_USER", payload: response.data.user })
      toast.success("Profile berhasil diperbarui!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Gagal memperbarui profile"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData)
      toast.success("Password berhasil diubah!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Gagal mengubah password"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
