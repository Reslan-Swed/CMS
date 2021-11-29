const ERRORS_KEY = "error";
const FORM_DATA_KEY = "form-data";

module.exports = {
  validate(schema) {
    return function (req, res, next) {
      const { value, error } = schema.validate(req.body);
      if (error) {
        req.flash(
          ERRORS_KEY,
          error.details.map((it) => it.message)
        );
        req.flash(FORM_DATA_KEY, req.body);
        return res.redirect("back");
      }
      req.formData = value;
      next();
    };
  },

  errorHandler(req, res, next) {
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
      const user = req.user;
      if (
        user ||
        (forbidden && !forbidden.some(it => it.test(url))) ||
        (allowed && allowed.some(it => it.test(url)))
      ) {
        return next();
      }
      return res.redirect(redirectUrl);
    };
  },
};
