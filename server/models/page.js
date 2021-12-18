const { DataTypes, Model } = require("sequelize");
const sequelize = require("../service/db").connection;

class Page extends Model {
    static identifier = 'id';
    static columns = {
        menuName: 'menuName',
        position: 'position',
        visible: 'visible',
        content: 'content',
        subjectId: 'subjectId'
    }
}

Page.init(
  {
    [Page.identifier]: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    [Page.columns.menuName]: {
      type: DataTypes.STRING,
    },
    [Page.columns.position]: {
      type: DataTypes.INTEGER,
    },
    [Page.columns.visible]: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    [Page.columns.content]: {
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
