require('dotenv').config();
const config = require('config');
const _ = require('lodash');

const dbConfig = config.get('dbConfig') || {};
const serverConfig = config.get('serverConfig') || {};

//enumerate all required configuration here
const missingRequiredConfig = _.reduce({
  database: dbConfig.database,
  username: dbConfig.username,
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  tokenSignSecret: serverConfig.tokenSignSecret,
  sessionSecret: serverConfig.sessionSecret
},  (result, value, key) => {
  if (!value) {
    result.push(key);
  }
  return result;
}, []);

if (missingRequiredConfig.length !== 0) {
  console.error(`FATAL ERROR:\n * ${missingRequiredConfig.join('\n * ')}\n${missingRequiredConfig.length > 1 ? 'are' : 'is'} not defined`);
  process.exit(1);
}

const express = require("express");
const fileUpload = require('express-fileupload');
const path = require('path');
const createError = require("http-errors");
const httpStatusCodes = require('http-status-codes').StatusCodes;
const sequelize = require("./service/db").connect(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig.host,
    dbConfig.port,
    dbConfig.dialect,
    !!dbConfig.enableLogging
);
const routes = require("./routes")(sequelize);
const apiRoutes = require("./routes/api");
const utils = require("./utils");

const app = express();
app.set("view engine", "ejs");
app.set("views", "./server/views");
app.use(express.static("public"));
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  useTempFiles: true,
  tempFileDir: path.resolve(__dirname, '../tmp'),
  abortOnLimit: true,
  debug: true
}));
// MAIN ENDPOINTS PREFIXES
// REST API Routes
app.use("/api", apiRoutes());
// HTML API Routes
app.use("/", routes());
app.use((req, res, next) => next(createError(httpStatusCodes.NOT_FOUND, "Page not found")));
app.use(utils.errorHandler(!!serverConfig.enableErrors));

(async () => {
  try {
    const port = serverConfig.port || 3000;
    await sequelize.sync();
    app.listen(port);
    console.log(`App started. listening on port ${port}`)
  } catch (e) {
    console.log("An error occurred while establishing a db connection");
    process.exit(1);
  }
})();
