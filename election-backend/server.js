const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001
app.set('trust proxy', 1); 
// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
)

// CORS configuration - VERY IMPORTANT for frontend-backend communication
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

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and preflight requests
    return req.method === "OPTIONS" || req.path === "/api/health" || req.path === "/"
  },
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
    timestamp: new Date().toISOString(),
  })
})

// Database test endpoint
app.get("/api/db-test", async (req, res) => {
  try {
    const { sequelize } = require("./models")
    await sequelize.authenticate()

    // Test a simple query
    const result = await sequelize.query("SELECT NOW() as current_time")

    res.json({
      success: true,
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
      database_time: result[0][0].current_time,
    })
  } catch (error) {
    console.error("Database test failed:", error)
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    })
  }
})

// Initialize database connection and routes
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

  console.log("Routes loaded successfully")
} catch (error) {
  console.error("Failed to load models or routes:", error)

  // Fallback routes when database is not available
  app.use("/api/*", (req, res) => {
    res.status(503).json({
      success: false,
      message: "Database connection failed - Service temporarily unavailable",
      error: process.env.NODE_ENV === "development" ? error.message : "Please try again later",
      timestamp: new Date().toISOString(),
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

// Database connection and server start
const startServer = async () => {
  try {
    if (sequelize) {
      console.log("Connecting to database...")
      console.log("Database config:", {
        host: process.env.SUPABASE_DB_HOST ? "SET" : "NOT SET",
        database: process.env.SUPABASE_DB_NAME ? "SET" : "NOT SET",
        user: process.env.SUPABASE_DB_USER ? "SET" : "NOT SET",
        password: process.env.SUPABASE_DB_PASSWORD ? "SET" : "NOT SET",
        port: process.env.SUPABASE_DB_PORT ? "SET" : "NOT SET",
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

    // Only start server if not in Vercel environment
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
        console.log(`Environment: ${process.env.NODE_ENV}`)
      })
    }
  } catch (error) {
    console.error("Unable to start server:", error)
    // Don't exit in production, let the server run without database
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      process.exit(1)
    }
  }
}

// Initialize database connection
startServer()

// Export for Vercel
module.exports = app
