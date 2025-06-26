const express = require("express")
const { Candidate, Election } = require("../models")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const { validateCandidate } = require("../middleware/validation")

const router = express.Router()

// Get all candidates for an election
router.get("/election/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params

    const candidates = await Candidate.findAll({
      where: {
        electionId,
        isActive: true,
      },
      include: [
        {
          model: Election,
          as: "election",
          attributes: ["id", "title", "status"],
        },
      ],
      order: [["candidateNumber", "ASC"]],
    })

    res.json({
      success: true,
      data: {
        candidates,
      },
    })
  } catch (error) {
    console.error("Get candidates error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get candidates",
      error: error.message,
    })
  }
})

// Get single candidate
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const candidate = await Candidate.findByPk(id, {
      include: [
        {
          model: Election,
          as: "election",
          attributes: ["id", "title", "status"],
        },
      ],
    })

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      })
    }

    res.json({
      success: true,
      data: {
        candidate,
      },
    })
  } catch (error) {
    console.error("Get candidate error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get candidate",
      error: error.message,
    })
  }
})

// Create new candidate (Admin only)
router.post("/", authenticateToken, requireAdmin, validateCandidate, async (req, res) => {
  try {
    const { name, party, description, photo, candidateNumber, electionId } = req.body

    // Check if election exists
    const election = await Election.findByPk(electionId)
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    // Check if candidate number is already taken for this election
    const existingCandidate = await Candidate.findOne({
      where: { candidateNumber, electionId },
    })

    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: "Candidate number already exists for this election",
      })
    }

    const candidate = await Candidate.create({
      name,
      party,
      description,
      photo,
      candidateNumber,
      electionId,
    })

    res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      data: {
        candidate,
      },
    })
  } catch (error) {
    console.error("Create candidate error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create candidate",
      error: error.message,
    })
  }
})

// Update candidate (Admin only)
router.put("/:id", authenticateToken, requireAdmin, validateCandidate, async (req, res) => {
  try {
    const { id } = req.params
    const { name, party, description, photo, candidateNumber, electionId } = req.body

    const candidate = await Candidate.findByPk(id)
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      })
    }

    // Check if candidate number is already taken by another candidate
    if (candidateNumber !== candidate.candidateNumber) {
      const existingCandidate = await Candidate.findOne({
        where: {
          candidateNumber,
          electionId,
          id: { [require("sequelize").Op.ne]: id },
        },
      })

      if (existingCandidate) {
        return res.status(400).json({
          success: false,
          message: "Candidate number already exists for this election",
        })
      }
    }

    await candidate.update({
      name,
      party,
      description,
      photo,
      candidateNumber,
      electionId,
    })

    res.json({
      success: true,
      message: "Candidate updated successfully",
      data: {
        candidate,
      },
    })
  } catch (error) {
    console.error("Update candidate error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update candidate",
      error: error.message,
    })
  }
})

// Delete candidate (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const candidate = await Candidate.findByPk(id)
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      })
    }

    // Soft delete by setting isActive to false
    await candidate.update({ isActive: false })

    res.json({
      success: true,
      message: "Candidate deleted successfully",
    })
  } catch (error) {
    console.error("Delete candidate error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete candidate",
      error: error.message,
    })
  }
})

module.exports = router
