const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
)

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://election-theta.vercel.app",
      /\.vercel\.app$/,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check (before database connection)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Election API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Election API Server",
    version: "1.0.0",
    status: "running",
  })
})

// Initialize database connection
let sequelize
try {
  const { sequelize: seq } = require("./models")
  sequelize = seq

  // Routes (only load after database is available)
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
} catch (error) {
  console.error("Failed to load models or routes:", error)

  // Fallback routes when database is not available
  app.use("/api/*", (req, res) => {
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      error: process.env.NODE_ENV === "development" ? error.message : "Service temporarily unavailable",
    })
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  })
})

// Database connection and server start
const startServer = async () => {
  try {
    if (sequelize) {
      console.log("Connecting to database...")
      console.log("Database config:", {
        host: process.env.SUPABASE_DB_HOST || "localhost",
        database: process.env.SUPABASE_DB_NAME || "election.db",
        user: process.env.SUPABASE_DB_USER || "root",
        port: process.env.SUPABASE_DB_PORT || "3306",
      })

      await sequelize.authenticate()
      console.log("Database connection established successfully.")

      // Sync database
      if (process.env.NODE_ENV !== "production") {
        await sequelize.sync({ alter: true })
        console.log("Database synchronized successfully.")
      } else {
        console.log("Production mode: Skipping database sync")
      }
    } else {
      console.log("Starting server without database connection")
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
    })
  } catch (error) {
    console.error("Unable to start server:", error)
    // Don't exit in production, let the server run without database
    if (process.env.NODE_ENV !== "production") {
      process.exit(1)
    }
  }
}

startServer()
module.exports = app
