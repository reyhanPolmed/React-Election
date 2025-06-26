const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Election = sequelize.define(
    "Election",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 200],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isAfterStartDate(value) {
            if (value <= this.startDate) {
              throw new Error("End date must be after start date")
            }
          },
        },
      },
      status: {
        type: DataTypes.ENUM("upcoming", "active", "completed"),
        defaultValue: "upcoming",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      maxVotesPerUser: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
    },
    {
      tableName: "elections",
      timestamps: true,
    },
  )

  return Election
}
