const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const { sequelize } = require("./models")
const authRoutes = require("./routes/auth")
const candidateRoutes = require("./routes/candidates")
const voteRoutes = require("./routes/votes")
const adminRoutes = require("./routes/admin")
const electionRoutes = require("./routes/elections")


const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/candidates", candidateRoutes)
app.use("/api/votes", voteRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/elections", electionRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Election API is running" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log("Database connection established successfully.")

    // Sync database (use { force: true } only in development to reset tables)
    await sequelize.sync({ alter: true })
    console.log("Database synchronized successfully.")

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Unable to start server:", error)
    process.exit(1)
  }
} 

startServer()

module.exports = app
