const _ = require('lodash');
const httpStatusCodes = require('http-status-codes').StatusCodes;

const ERRORS_KEY = 'error';
const FORM_DATA_KEY = 'form-data';

const isAcceptJson = request => request.accepts(['html', 'json']) === 'json';

module.exports = {
    validate(schema) {
        return function (req, res, next) {
            const {value, error} = schema.validate(req.body);
            if (!error) {
                req.formData = value;
                return next();
            }
            if (isAcceptJson(req)) {
                return res.json({
                    [ERRORS_KEY]: error.details.map(it => _.pick(it, ['message', 'type']))
                });
            }
            req.flash(
                ERRORS_KEY,
                error.details.map(it => it.message)
            );
            req.flash(FORM_DATA_KEY, req.body);
            res.redirect('back');
        };
    },

    formErrorsExtractor(req, res, next) {
        res.locals.errors = req.flash(ERRORS_KEY);
        const formData = req.flash(FORM_DATA_KEY);
        req.formData = formData.length > 0 ? formData[0] : null;
        next();
    },

    requireLogin(redirectUrl, include = null, exclude = null) {
        const forbidden = include ? [...include.map(it => new RegExp(`^${it}$`))] : null;
        const allowed = exclude ? [...exclude.map(it => new RegExp(`^${it}$`))] : null;

        return function (req, res, next) {
            const url = req.url;
            if (req.isAuthenticated() ||
                (forbidden && !forbidden.some(it => it.test(url))) ||
                (allowed && allowed.some(it => it.test(url)))) {
                return next();
            }
            if (isAcceptJson(req)) {
                return res.status(httpStatusCodes.FORBIDDEN).send();
            }
            res.redirect(redirectUrl);
        };
    },

    errorHandler(enableErrorPreview = false) {
        return (err, req, res, next) => {
            const error = {
                status: err.status || httpStatusCodes.INTERNAL_SERVER_ERROR,
                message: err.name,
                error: enableErrorPreview ? err : ''
            };
            res.status(error.status);
            if (isAcceptJson(req)) {
                return res.json(error);
            }
            res.locals = {
                ...res.locals,
                ...error
            };
            res.render('error');
        }
    }
};
