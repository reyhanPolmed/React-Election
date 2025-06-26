const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Candidate = sequelize.define(
    "Candidate",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 100],
        },
      },
      party: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [2, 100],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      photo: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      candidateNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
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
      voteCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "candidates",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["candidateNumber", "electionId"],
        },
      ],
    },
  )

  return Candidate
}
