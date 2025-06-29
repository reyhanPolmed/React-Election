const express = require("express")
const crypto = require("crypto")
const { Vote, Candidate, Election, User } = require("../models")
const { authenticateToken, requireVerified } = require("../middleware/auth")

const router = express.Router()

// Cast vote
router.post("/", authenticateToken, requireVerified, async (req, res) => {
  try {
    const { candidateId, electionId } = req.body
    const userId = req.user.id

    // Check if election exists and is active
    const election = await Election.findByPk(electionId)
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    if (election.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Election is not currently active",
      })
    }

    // Check if election is within voting period
    const now = new Date()
    if (now < election.startDate || now > election.endDate) {
      return res.status(400).json({
        success: false,
        message: "Voting is not allowed at this time",
      })
    }

    // Check if user has already voted in this election
    const existingVote = await Vote.findOne({
      where: { userId, electionId },
    })

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted in this election",
      })
    }

    // Check if candidate exists and belongs to this election
    const candidate = await Candidate.findOne({
      where: {
        id: candidateId,
        electionId,
        isActive: true,
      },
    })

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found or not active",
      })
    }

    // Generate vote hash for anonymity
    const voteHash = crypto
      .createHash("sha256")
      .update(`${userId}-${candidateId}-${electionId}-${Date.now()}`)
      .digest("hex")

    // Create vote record
    const vote = await Vote.create({
      userId,
      candidateId,
      electionId,
      voteHash,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    // Update candidate vote count
    await candidate.increment("voteCount")

    res.status(201).json({
      success: true,
      message: "Vote cast successfully",
      data: {
        voteHash: vote.voteHash,
        timestamp: vote.createdAt,
      },
    })
  } catch (error) {
    console.error("Vote casting error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cast vote",
      error: error.message,
    })
  }
})

// Get user's vote status for an election
router.get("/status/:electionId", authenticateToken, async (req, res) => {
  try {
    const { electionId } = req.params
    const userId = req.user.id

    const vote = await Vote.findOne({
      where: { userId, electionId },
      attributes: ["voteHash", "createdAt"],
    })

    res.json({
      success: true,
      data: {
        hasVoted: !!vote,
        voteHash: vote?.voteHash,
        votedAt: vote?.createdAt,
      },
    })
  } catch (error) {
    console.error("Vote status error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get vote status",
      error: error.message,
    })
  }
})

// Get user's voting history <-- new
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const votes = await Vote.findAll({
      where: { userId },
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["name", "candidateNumber", "party"],
        },
        {
          model: Election,
          as: "election",
          attributes: ["title", "startDate", "endDate", "status"],
        },
      ],
      attributes: ["voteHash", "createdAt"],
      order: [["createdAt", "DESC"]],
    })

    res.json({
      success: true,
      data: {
        votes,
        totalVotes: votes.length,
      },
    })
  } catch (error) {
    console.error("Vote history error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get vote history",
      error: error.message,
    })
  }
})

// Verify vote by hash (public endpoint)
router.get("/verify/:voteHash", async (req, res) => {
  try {
    const { voteHash } = req.params

    const vote = await Vote.findOne({
      where: { voteHash },
      attributes: ["voteHash", "createdAt"],
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
    })

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "Vote not found",
      })
    }

    res.json({
      success: true,
      data: {
        voteHash: vote.voteHash,
        timestamp: vote.createdAt,
        candidate: vote.candidate,
        election: vote.election,
      },
    })
  } catch (error) {
    console.error("Vote verification error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify vote",
      error: error.message,
    })
  }
})

module.exports = router
