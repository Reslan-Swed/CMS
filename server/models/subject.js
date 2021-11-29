const { DataTypes, Model } = require("sequelize");
const sequelize = require("../lib/db").connection;
const Page = require("./page");

class Subject extends Model {}

Subject.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    menuName: {
      type: DataTypes.STRING,
    },
    position: {
      type: DataTypes.INTEGER,
    },
    visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize: sequelize(),
    modelName: "subject",
    tableName: "subjects",
  }
);

Subject.hasMany(Page, {
  foreignKey: {
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});
Page.belongsTo(Subject);

module.exports = Subject;
