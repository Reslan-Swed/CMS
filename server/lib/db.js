const { Sequelize } = require("sequelize");

let sequelize = null;

module.exports = {
  connection: () => sequelize,

  connect(database, username, password, host, dialect) {
    sequelize =
      sequelize ||
      new Sequelize(database, username, password, {
        host,
        dialect,
        logging: false
      });
    return sequelize;
  },

  async isConnected() {
    try {
      return sequelize && (await sequelize.authenticate());
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      return false;
    }
  },

  async close() {
    await sequelize.close();
    sequelize = null;
  },

  async sync(alter = false, force = false) {
    return sequelize && (await sequelize.sync(alter ? { alter } : { force }));
  },
};
