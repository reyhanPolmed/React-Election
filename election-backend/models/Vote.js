const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Vote = sequelize.define(
    "Vote",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "candidates",
          key: "id",
        },
      },
      electionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "elections",
          key: "id",
        },
      },
      voteHash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "votes",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "electionId"],
        },
      ],
    },
  )

  return Vote
}
