const express = require("express")
const { Election, Candidate } = require("../models")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get all elections (public - untuk melihat daftar)
router.get("/", async (req, res) => {
  try {
    const elections = await Election.findAll({
      where: {
        isActive: true,
      },
      include: [
        {
          model: Candidate,
          as: "candidates",
          attributes: ["id", "name", "candidateNumber"],
          where: { isActive: true },
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.json({
      success: true,
      data: {
        elections,
      },
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

// Get active elections only
router.get("/active", async (req, res) => {
  try {
    const now = new Date()

    const elections = await Election.findAll({
      where: {
        status: "active",
        isActive: true,
        startDate: {
          [require("sequelize").Op.lte]: now,
        },
        endDate: {
          [require("sequelize").Op.gte]: now,
        },
      },
      include: [
        {
          model: Candidate,
          as: "candidates",
          attributes: ["id", "name", "candidateNumber", "party"],
          where: { isActive: true },
          required: false,
        },
      ],
      order: [["startDate", "ASC"]],
    })

    res.json({
      success: true,
      data: {
        elections,
      },
    })
  } catch (error) {
    console.error("Get active elections error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get active elections",
      error: error.message,
    })
  }
})

// Get single election by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const election = await Election.findByPk(id, {
      include: [
        {
          model: Candidate,
          as: "candidates",
          attributes: ["id", "name", "party", "description", "candidateNumber", "photo"],
          where: { isActive: true },
          required: false,
          order: [["candidateNumber", "ASC"]],
        },
      ],
    })

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    res.json({
      success: true,
      data: {
        election,
      },
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

// Get upcoming elections
router.get("/status/upcoming", async (req, res) => {
  try {
    const now = new Date()

    const elections = await Election.findAll({
      where: {
        status: "upcoming",
        isActive: true,
        startDate: {
          [require("sequelize").Op.gt]: now,
        },
      },
      include: [
        {
          model: Candidate,
          as: "candidates",
          attributes: ["id", "name", "candidateNumber"],
          where: { isActive: true },
          required: false,
        },
      ],
      order: [["startDate", "ASC"]],
    })

    res.json({
      success: true,
      data: {
        elections,
      },
    })
  } catch (error) {
    console.error("Get upcoming elections error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get upcoming elections",
      error: error.message,
    })
  }
})

// Get completed elections
router.get("/status/completed", async (req, res) => {
  try {
    const elections = await Election.findAll({
      where: {
        status: "completed",
        isActive: true,
      },
      include: [
        {
          model: Candidate,
          as: "candidates",
          attributes: ["id", "name", "candidateNumber", "voteCount"],
          where: { isActive: true },
          required: false,
          order: [["voteCount", "DESC"]],
        },
      ],
      order: [["endDate", "DESC"]],
    })

    res.json({
      success: true,
      data: {
        elections,
      },
    })
  } catch (error) {
    console.error("Get completed elections error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get completed elections",
      error: error.message,
    })
  }
})

module.exports = router
