const jwt = require("jsonwebtoken")
const { User } = require("../models")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      })
    }

    console.error("Auth middleware error:", error)
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    })
  }
  next()
}

const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Account verification required",
    })
  }
  next()
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireVerified,
}
