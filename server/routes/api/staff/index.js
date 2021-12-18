const express = require("express");
const Joi = require("joi");
const passport = require("passport");
const utils = require("../../../utils");
const subjectRouter = require("./subject");
const authentication = require("../../../service/authentication");

const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

module.exports = (options) => {
    const router = express.Router(options);

    router.post(
        "/login",
        utils.validate(schema),
        passport.authenticate("local", {session: false}),
        authentication.issueToken()
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
