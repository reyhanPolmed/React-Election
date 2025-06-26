const { DataTypes } = require("sequelize")
const bcrypt = require("bcryptjs")

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 100],
        },
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 100],
        },
      },
      nik: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
        validate: {
          len: [16, 16],
          isNumeric: true,
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        validate: {
          isNumeric: true,
        },
      },
      role: {
        type: DataTypes.ENUM("voter", "admin"),
        defaultValue: "voter",
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hasVoted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      lastLogin: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 12)
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 12)
          }
        },
      },
    },
  )

  // Instance methods
  User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
  }

  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get())
    delete values.password
    return values
  }

  return User
}
