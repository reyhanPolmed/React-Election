const express = require("express")
const { Op } = require("sequelize")
const { User, Election, Candidate, Vote } = require("../models")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const { validateElection } = require("../middleware/validation")

const router = express.Router()

// Dashboard statistics
router.get("/dashboard", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: "voter" } })
    const totalElections = await Election.count()
    const activeElections = await Election.count({ where: { status: "active" } })
    const totalVotes = await Vote.count()
    const verifiedUsers = await User.count({ where: { isVerified: true } })

    // Get recent votes
    const recentVotes = await Vote.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["name", "candidateNumber"],
        },
        {
          model: Election,
          as: "election",
          attributes: ["title"],
        },
      ],
      attributes: ["voteHash", "createdAt"],
    })

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalElections,
          activeElections,
          totalVotes,
          verifiedUsers,
          voterTurnout: totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(2) : 0,
        },
        recentVotes,
      },
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: error.message,
    })
  }
})

// Get all users
router.get("/users", authenticateToken,requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", verified } = req.query
    const offset = (page - 1) * limit

    const whereClause = {
      role: "voter",
    }

    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { nik: { [Op.like]: `%${search}%` } },
      ]
    }

    if (verified !== undefined) {
      whereClause.isVerified = verified === "true"
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
    })

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    })
  }
})

// Verify user
router.put("/users/:id/verify", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    await user.update({ isVerified: true })

    res.json({
      success: true,
      message: "User verified successfully",
      data: { user },
    })
  } catch (error) {
    console.error("Verify user error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify user",
      error: error.message,
    })
  }
})

// Get all elections
router.get("/elections", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const elections = await Election.findAll({
      include: [
        {
          model: Candidate,
          as: "candidates",
          attributes: ["id", "name", "candidateNumber", "voteCount"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.json({
      success: true,
      data: { elections },
    })
  } catch (error) {
    console.error("Get elections error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get elections",
      error: error.message,
    })
  }
})

// Get elections by id
router.get("/elections/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params
  try {
    const election = await Election.findByPk(id)

    res.json({
      success: true,
      data: { election },
    })
  } catch (error) {
    console.error("Get election error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get election",
      error: error.message,
    })
  }
})

// Create election
router.post("/elections", authenticateToken, requireAdmin, validateElection, async (req, res) => {
  try {
    const { title, description, startDate, endDate, maxVotesPerUser } = req.body

    const election = await Election.create({
      title,
      description,
      startDate,
      endDate,
      maxVotesPerUser,
    })

    res.status(201).json({
      success: true,
      message: "Election created successfully",
      data: { election },
    })
  } catch (error) {
    console.error("Create election error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create election",
      error: error.message,
    })
  }
})

// Update election status
router.put("/elections/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!["upcoming", "active", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      })
    }

    const election = await Election.findByPk(id)
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    await election.update({ status })

    res.json({
      success: true,
      message: "Election status updated successfully",
      data: { election },
    })
  } catch (error) {
    console.error("Update election status error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update election status",
      error: error.message,
    })
  }
})

// Get election results
router.get("/elections/:id/results", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const election = await Election.findByPk(id, {
      include: [
        {
          model: Candidate,
          as: "candidates",
          attributes: ["id", "name", "party", "candidateNumber", "voteCount"],
          order: [["voteCount", "DESC"]],
        },
      ],
    })

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    const totalVotes = await Vote.count({ where: { electionId: id } })
    const totalVoters = await User.count({ where: { role: "voter", isVerified: true } })

    const results = election.candidates.map((candidate) => ({
      ...candidate.toJSON(),
      percentage: totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(2) : 0,
    }))

    res.json({
      success: true,
      data: {
        election: {
          id: election.id,
          title: election.title,
          status: election.status,
          startDate: election.startDate,
          endDate: election.endDate,
        },
        results,
        statistics: {
          totalVotes,
          totalVoters,
          turnout: totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(2) : 0,
        },
      },
    })
  } catch (error) {
    console.error("Get election results error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get election results",
      error: error.message,
    })
  }
})

// Get voting analytics
router.get("/analytics/voting", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { electionId, period = "24h" } = req.query

    let dateFilter = {}
    const now = new Date()

    switch (period) {
      case "1h":
        dateFilter = { [Op.gte]: new Date(now - 60 * 60 * 1000) }
        break
      case "24h":
        dateFilter = { [Op.gte]: new Date(now - 24 * 60 * 60 * 1000) }
        break
      case "7d":
        dateFilter = { [Op.gte]: new Date(now - 7 * 24 * 60 * 60 * 1000) }
        break
      case "30d":
        dateFilter = { [Op.gte]: new Date(now - 30 * 24 * 60 * 60 * 1000) }
        break
    }

    const whereClause = {
      createdAt: dateFilter,
    }

    if (electionId) {
      whereClause.electionId = electionId
    }

    const votingTrend = await Vote.findAll({
      where: whereClause,
      attributes: [
        [require("sequelize").fn("DATE", require("sequelize").col("createdAt")), "date"],
        [require("sequelize").fn("COUNT", require("sequelize").col("id")), "count"],
      ],
      group: [require("sequelize").fn("DATE", require("sequelize").col("createdAt"))],
      order: [[require("sequelize").fn("DATE", require("sequelize").col("createdAt")), "ASC"]],
    })

    res.json({
      success: true,
      data: {
        votingTrend,
        period,
      },
    })
  } catch (error) {
    console.error("Get voting analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get voting analytics",
      error: error.message,
    })
  }
})

module.exports = router
