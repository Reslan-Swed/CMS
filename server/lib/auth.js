const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { Admin } = require("../models");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await Admin.findOne({
        where: {
          username,
        },
      });
      if (user && (await user.comparePassword(password))) {
        return done(null, user);
      }
      return done(null, false, { message: "Invalid username or password" });
    } catch (e) {
      return done(e);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Admin.findByPk(id);
    return done(null, user);
  } catch (e) {
    return done(e);
  }
});

module.exports = {
  initialize: passport.initialize(),
  session: passport.session(),
  setUser(req, res, next) {
    res.locals.user = req.user;
    next();
  },
};
