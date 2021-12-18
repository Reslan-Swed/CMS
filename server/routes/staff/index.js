const express = require("express");
const Joi = require("joi");
const passport = require("passport");
const utils = require("../../utils");
const subjectRouter = require("./subject");

const schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = (options) => {
  const router = express.Router(options);

  router.get("/", (req, res, next) =>
    res.render("index", { pageTitle: "Staff Menu" })
  );

  router.get("/login", (req, res, next) => {
    const formData = req.formData || {};
    res.render("login", { pageTitle: "Log in", username: formData.username || "" });
  });

  router.post(
    "/login",
    utils.validate(schema),
    passport.authenticate("local", {
      successRedirect: "/staff",
      failureRedirect: "back",
      failureFlash: "Invalid username or password",
    })
  );

  router.get("/logout", (req, res, next) => {
    req.logOut(); //added by passport middleware
    return res.redirect("/staff/login");
  });

  router.get("/admins", (req, res, next) => {
    return res.send("Admins");
  });

  router.use('/subjects', subjectRouter());

  return router;
};
