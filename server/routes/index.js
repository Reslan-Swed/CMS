const config = require('config');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const flash = require('connect-flash');
const authentication = require('../service/authentication');
const utils = require('../utils');
const staffRouter = require('./staff');
const subjectRepo = require('../repository/subject-repository');
const pageRepo = require('../repository/page-repository');

const SESSION_SECRET = config.get('serverConfig.sessionSecret');

module.exports = sequelize => options => {
    const router = express.Router(options);
    router.get('/favicon.ico', (req, res) => res.sendStatus(204));
    router.use(express.urlencoded({extended: true}));
    router.use(cookieParser(SESSION_SECRET));
    router.use(
        session({
            secret: SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            store: new SequelizeStore({
                db: sequelize,
            }),
        })
    );
    router.use(authentication.initialize);
    router.use(authentication.session);
    router.use(authentication.setUser);
    router.use(authentication.isAuthenticated);
    router.use(flash());
    router.use(utils.formErrorsExtractor);
    router.use(
        utils.requireLogin(
            '/staff/login', null, ['/\\?.*', '/staff/login']
        )
    );

    router.get('/', async (req, res) => {
        const preview = req.user && req.query.preview;
        const subjects = await subjectRepo.findByPreview(preview);
        const subjectId = req.query.subjectId || subjects[0].id;
        const pageId = req.query.id;
        const page = await pageRepo.findByPreviewAndPKorElseFirstBySubject(pageId, subjectId, preview);
        if (!page) {
            return res.redirect('/');
        }
        return res.render('public/index', {
            pageTitle: `${page.menuName}`,
            preview: preview,
            subjects,
            page,
        });
    });

    router.use('/staff', staffRouter());

    return router;
};

