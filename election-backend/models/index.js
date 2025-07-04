const { Sequelize } = require("sequelize")
// const config = require("../config/database")

// const env = process.env.NODE_ENV || "development"
// const dbConfig = config[env]

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
})

// Import models
const User = require("./User")(sequelize)
const Candidate = require("./Candidate")(sequelize)
const Vote = require("./Vote")(sequelize)
const Election = require("./Election")(sequelize)

// Define associations
User.hasMany(Vote, { foreignKey: "userId", as: "votes" })
Vote.belongsTo(User, { foreignKey: "userId", as: "user" })

Candidate.hasMany(Vote, { foreignKey: "candidateId", as: "votes" })
Vote.belongsTo(Candidate, { foreignKey: "candidateId", as: "candidate" })

Election.hasMany(Candidate, { foreignKey: "electionId", as: "candidates" })
Candidate.belongsTo(Election, { foreignKey: "electionId", as: "election" })

Election.hasMany(Vote, { foreignKey: "electionId", as: "votes" })
Vote.belongsTo(Election, { foreignKey: "electionId", as: "election" })

module.exports = {
  sequelize,
  User,
  Candidate,
  Vote,
  Election,
}
