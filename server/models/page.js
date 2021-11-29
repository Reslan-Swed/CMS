const { DataTypes, Model } = require("sequelize");
const sequelize = require("../lib/db").connection;

class Page extends Model {}

Page.init(
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
    content: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize: sequelize(),
    modelName: "page",
    tableName: "pages",
  }
);

module.exports = Page;
