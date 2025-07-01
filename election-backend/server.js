require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy (penting untuk hosting seperti Vercel)
app.set("trust proxy", 1)

// ========== MIDDLEWARE ========== //

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
)

// CORS
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://react-election.vercel.app",
      "https://election-theta.vercel.app",
      /\.vercel\.app$/,
      /localhost:\d+$/,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  }),
)

// Handle preflight requests
app.options("*", cors())

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
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS" || req.path === "/api/health" || req.path === "/",
  }),
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
    endpoints: {
      health: "/api/health",
      dbTest: "/api/db-test",
      auth: "/api/auth",
      elections: "/api/elections",
      candidates: "/api/candidates",
      votes: "/api/votes",
      admin: "/api/admin",
    },
  })
})

app.get("/api/db-test", async (req, res) => {
  try {
    const { sequelize } = require("./models")
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

// ========== LOAD ROUTES IMMEDIATELY ========== //
// Load routes immediately, not after database connection
let sequelize
let routesLoaded = false

try {
  const { sequelize: seq } = require("./models")
  sequelize = seq

  // Load routes immediately
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

  routesLoaded = true
  console.log("✅ Routes loaded successfully")
} catch (error) {
  console.error("❌ Failed to load models or routes:", error)

  // Fallback routes when models fail to load
  app.use("/api/auth/*", (req, res) => {
    res.status(503).json({
      success: false,
      message: "Authentication service temporarily unavailable",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  })

  app.use("/api/*", (req, res) => {
    res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  })
}

// ========== ERROR HANDLING ========== //

app.use((err, req, res, next) => {
  console.error("Error:", err.stack)

  // Handle specific Sequelize errors
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    })
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry",
      field: err.errors[0]?.path,
    })
  }

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
    availableEndpoints: routesLoaded
      ? [
          "/api/health",
          "/api/db-test",
          "/api/auth/login",
          "/api/auth/register",
          "/api/elections",
          "/api/candidates",
          "/api/votes",
          "/api/admin",
        ]
      : ["/api/health", "/api/db-test"],
  })
})

// ========== START SERVER ========== //

const startServer = async () => {
  try {
    if (sequelize) {
      console.log("🔌 Connecting to database...")
      console.log("Database config:", {
        host: process.env.SUPABASE_DB_HOST ? "SET" : "NOT SET",
        database: process.env.SUPABASE_DB_NAME ? "SET" : "NOT SET",
        user: process.env.SUPABASE_DB_USER ? "SET" : "NOT SET",
        password: process.env.SUPABASE_DB_PASSWORD ? "SET" : "NOT SET",
        port: process.env.SUPABASE_DB_PORT ? "SET" : "NOT SET",
      })

      await sequelize.authenticate()
      console.log("✅ Database connected successfully")

      // Sync database only in development
      if (process.env.NODE_ENV === "development") {
        await sequelize.sync({ alter: true })
        console.log("🛠️ Database synchronized")
      } else {
        console.log("Production mode: Skipping database sync")
      }
    } else {
      console.log("⚠️ Starting server without database connection")
    }

    // Only start server if not in Vercel environment
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`)
        console.log(`Environment: ${process.env.NODE_ENV}`)
        console.log(`Routes loaded: ${routesLoaded}`)
      })
    } else {
      console.log("Vercel environment detected - server ready")
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)

    // Server can still run without database for health checks
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT} (DB disconnected)`)
        console.log(`Routes loaded: ${routesLoaded}`)
      })
    }
  }
}

startServer()

// Export for Vercel
module.exports = app
