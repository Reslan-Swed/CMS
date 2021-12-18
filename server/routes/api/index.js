const express = require('express');
const authentication = require('../../service/authentication');
const utils = require('../../utils');
const staffRouter = require('./staff');

module.exports = (options) => {
    const router = express.Router(options);
    router.use(express.json());
    router.use(authentication.initialize);
    router.use(authentication.token);
    router.use(authentication.isAuthenticated);
    router.use(
        utils.requireLogin(
            '/staff/login', null, ['/staff/login']
        )
    );

    router.use('/staff', staffRouter());

    return router;
};