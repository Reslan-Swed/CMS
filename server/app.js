const express = require("express");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
// initalize sequelize with session store
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const flash = require("connect-flash");
const sequelize = require("./lib/db").connect(
  "globe_bank_cluster",
  "root",
  "",
  "localhost",
  "mysql"
);
const auth = require("./lib/auth");
const routes = require("./routes");
const utils = require("./utils");

const app = express();
app.set("view engine", "ejs");
app.set("views", "./server/views");
app.use(express.static("public"));
app.get("/favicon.ico", (req, res, next) => res.sendStatus(204));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("secret-passcode"));
app.use(
  session({
    secret: "secret-passcode",
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({
      db: sequelize,
    }),
  })
);
app.use(auth.initialize);
app.use(auth.session);
app.use(auth.setUser);
app.use(flash());
app.use(utils.errorHandler);
app.use(
  utils.requireLogin(
    "/staff/login", null, ["/\\?.*", "/staff/login"]
  )
);
app.use("/", routes());
app.use((req, res, next) => next(createError(404, "Page not found")));
app.use((err, req, res, next) => {
  res.locals.message = err.name;
  const status = err.status || 500;
  res.locals.status = status;
  res.locals.error = app.get("env") === "development" ? err : {};
  res.status(status);
  res.render("error");
});

(async () => {
  try {
    await sequelize.sync();
    app.listen(3000);
    console.log("App started. listening on port 3000")
  } catch (e) {
    console.log("An error occurred while establishing a db connection");
    process.exit(1);
  }
})();
