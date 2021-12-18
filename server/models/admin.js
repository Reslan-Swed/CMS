const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../service/db").connection;

const SALT_ROUNDS = 12;

class Admin extends Model {
  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        minLength(value) {
          if (value.length < 8) {
            throw new Error("Password should be at least 8 length");
          }
        },
      },
    },
  },
  {
    sequelize: sequelize(),
    modelName: "admin",
    tableName: "admins",
    hooks: {
      beforeSave: async (admin, options) => {
        admin.password = await bcrypt.hash(admin.password, SALT_ROUNDS);
        console.log(admin);
      },
    },
  }
);

module.exports = Admin;
