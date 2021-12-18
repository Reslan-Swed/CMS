const config = require('config');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require('jsonwebtoken');
const createError = require("http-errors");
const httpStatusCodes = require('http-status-codes').StatusCodes;
const {Admin} = require("../models");

const TOKEN_SIGN_SECRET = config.get('serverConfig.tokenSignSecret');
const USER_IDENTIFIER_TOKEN_PAYLOAD_KEY = 'user';
const AUTHORIZATION_HEADER = 'Authorization';
const bearerSchema = new RegExp(`Bearer (?<token>.*)`);

const userSerializer = user => user.id;

const userDeserializer = async id => await Admin.findByPk(id);

const extractTokenUser = async (req, res, next) => {
    const authorizationHeader = req.get(AUTHORIZATION_HEADER);

    if (authorizationHeader && bearerSchema.test(authorizationHeader)) {
        const token = authorizationHeader.match(bearerSchema).groups.token;
        try {
            const decodedToken = jwt.verify(token, TOKEN_SIGN_SECRET);
            if (decodedToken && decodedToken[USER_IDENTIFIER_TOKEN_PAYLOAD_KEY]) {
                req.user = await userDeserializer(decodedToken[USER_IDENTIFIER_TOKEN_PAYLOAD_KEY]);
            }
        } catch (e) {
            if (e instanceof jwt.TokenExpiredError) {
                return next(createError(httpStatusCodes.UNAUTHORIZED, e))
            }
            next(e);
        }
    }

    next();
};

const issueToken = (expiryDuration = '1h') => (req, res) => {
    const token = jwt.sign({
        [USER_IDENTIFIER_TOKEN_PAYLOAD_KEY]: userSerializer(req.user)
    }, TOKEN_SIGN_SECRET, {expiresIn: expiryDuration});
    res.json({token});
};

const isAuthenticated = (req, res, next) => {
    req.isAuthenticated = () => !!req.user;
    next();
};

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
            return done(null, false, {message: "Invalid username or password"});
        } catch (e) {
            return done(e);
        }
    })
);

passport.serializeUser((user, done) => done(null, userSerializer(user)));

passport.deserializeUser(async (id, done) => {
    try {
        done(null, await userDeserializer(id));
    } catch (e) {
        done(e);
    }
});

module.exports = {
    initialize: passport.initialize(),
    session: passport.session(),
    token: extractTokenUser,
    isAuthenticated,
    issueToken,
    setUser(req, res, next) {
        res.locals.user = req.user;
        next();
    },
};