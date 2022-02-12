const _ = require('lodash');
const createError = require('http-errors');
const path = require('path');
const httpStatusCodes = require('http-status-codes').StatusCodes;
const { v4: uuidv4 } = require('uuid');

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
    },

    fileUploader(fileFieldName) {
        return (req, res, next) => {
            try {
                if (!req.files) {
                    res.send({
                        status: false,
                        message: 'No file uploaded'
                    });
                } else {
                    const file = req.files[fileFieldName];
                    const fileName = `${uuidv4()}${path.extname(file.name)}`;

                    file.mv(path.resolve(__dirname, '../../public/uploads/', fileName));

                    res.send({
                        status: true,
                        message: 'File is uploaded',
                        data: {
                            name: fileName,
                            path: `/uploads/${fileName}`,
                            mimetype: file.mimetype,
                            size: file.size
                        }
                    });
                }
            } catch (err) {
                next(createError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'File uploading failed'));
            }
        };
    }
};
