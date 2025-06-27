const express = require("express")
const jwt = require("jsonwebtoken")
const { User } = require("../models")
const { validateRegister, validateLogin } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")
const { Op } = require("sequelize"); 
const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, nik, dateOfBirth, address, phone } = req.body

    // Check if user already exists
    // Create new user
    const user = await User.create({
      email,
      password,
      fullName,
      nik,
      dateOfBirth,
      address,
      phone,
    })

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    })
  }
})

// Login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Update last login
    await user.update({ lastLogin: new Date() })

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    })
  }
})

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    })
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    })
  }
})

// Update profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { fullName, address, phone } = req.body

    await req.user.update({
      fullName: fullName || req.user.fullName,
      address: address || req.user.address,
      phone: phone || req.user.phone,
    })

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: req.user,
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    })
  }
})

// Change password
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Validate current password
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Update password
    await req.user.update({ password: newPassword })

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    })
  }
})

module.exports = router
