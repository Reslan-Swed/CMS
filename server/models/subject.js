const { DataTypes, Model } = require("sequelize");
const sequelize = require("../service/db").connection;
const Page = require("./page");

class Subject extends Model {
    static identifier = 'id';
    static columns = {
        menuName: 'menuName',
        position: 'position',
        visible: 'visible'
    };
}

Subject.init(
  {
    [Subject.identifier]: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    [Subject.columns.menuName]: {
      type: DataTypes.STRING,
    },
    [Subject.columns.position]: {
      type: DataTypes.INTEGER,
    },
    [Subject.columns.visible]: {
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
