// server.js
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { sequelize } = require("./models")

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy (penting untuk hosting seperti Railway/Render)
app.set("trust proxy", 1)

// ========== MIDDLEWARE ========== //
// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
)

// CORS
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      /\.vercel\.app$/, // allow any vercel frontend
      /localhost:\d+$/, // allow local frontend
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
)

// Body parser
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

// Rate Limiter
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) =>
      req.method === "OPTIONS" || req.path === "/api/health" || req.path === "/",
  })
)

// ========== HEALTH CHECK ========== //
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Election API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Election API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

app.get("/api/db-test", async (req, res) => {
  try {
    await sequelize.authenticate()
    const result = await sequelize.query("SELECT NOW() as current_time")
    res.json({
      success: true,
      message: "Database connected successfully",
      timestamp: new Date().toISOString(),
      db_time: result[0][0].current_time,
    })
  } catch (error) {
    console.error("DB test failed:", error)
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    })
  }
})

// ========== ROUTES (lazy load after DB ready) ========== //
const loadRoutes = () => {
  const authRoutes = require("./routes/auth")
  const candidateRoutes = require("./routes/candidates")
  const voteRoutes = require("./routes/votes")
  const adminRoutes = require("./routes/admin")
  const electionRoutes = require("./routes/elections")

  app.use("/api/auth", authRoutes)
  app.use("/api/candidates", candidateRoutes)
  app.use("/api/votes", voteRoutes)
  app.use("/api/admin", adminRoutes)
  app.use("/api/elections", electionRoutes)

  console.log("✅ Routes loaded")
}

// ========== ERROR HANDLING ========== //
app.use((err, req, res, next) => {
  console.error("Error:", err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  })
})

// ========== START SERVER ========== //
const startServer = async () => {
  try {
    console.log("🔌 Connecting to database...")
    await sequelize.authenticate()
    console.log("✅ Database connected")

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true }) // sync in dev only
      console.log("🛠️ DB synced")
    }

    loadRoutes()

    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`)
      })
    }
  } catch (error) {
    console.error("❌ Startup error:", error.message)

    // Fallback: show 503 if DB unavailable
    app.use("/api/*", (req, res) => {
      res.status(503).json({
        success: false,
        message: "Database unavailable - service temporarily down",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
        timestamp: new Date().toISOString(),
      })
    })

    if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
      process.exit(1)
    }
  }
}

startServer()

// For Vercel
module.exports = app
