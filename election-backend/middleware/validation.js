const { body, validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

const validateRegister = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("fullName").trim().isLength({ min: 2, max: 100 }).withMessage("Full name must be between 2 and 100 characters"),
  body("nik").isLength({ min: 16, max: 16 }).isNumeric().withMessage("NIK must be exactly 16 digits"),
  body("dateOfBirth").isISO8601().withMessage("Valid date of birth is required"),
  body("address").trim().isLength({ min: 10 }).withMessage("Address must be at least 10 characters long"),
  body("phone").isMobilePhone("id-ID").withMessage("Valid Indonesian phone number is required"),
  handleValidationErrors,
]

const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

const validateCandidate = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Candidate name must be between 2 and 100 characters"),
  body("party")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Party name must be between 2 and 100 characters"),
  body("candidateNumber").isInt({ min: 1 }).withMessage("Candidate number must be a positive integer"),
  body("electionId").isInt({ min: 1 }).withMessage("Valid election ID is required"),
  body("photo").optional().isURL().withMessage("Photo must be a valid URL"),
  handleValidationErrors,
]

const validateElection = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Election title must be between 3 and 200 characters"),
  body("startDate").isISO8601().withMessage("Valid start date is required"),
  body("endDate").isISO8601().withMessage("Valid end date is required"),
  body("maxVotesPerUser").optional().isInt({ min: 1 }).withMessage("Max votes per user must be a positive integer"),
  handleValidationErrors,
]

module.exports = {
  validateRegister,
  validateLogin,
  validateCandidate,
  validateElection,
  handleValidationErrors,
}
