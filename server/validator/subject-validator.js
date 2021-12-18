const Joi = require('joi');
const Subject = require('../models/subject');

const formFields = {
    menuName: Subject.columns.menuName,
    position: Subject.columns.position,
    visible: Subject.columns.visible
};

const validationSchema = Joi.object({
    [formFields.menuName]: Joi.string().min(3).max(30).required(),
    [formFields.position]: Joi.number().integer().min(1).required(),
    [formFields.visible]: Joi.boolean().default(false),
});

module.exports = {
    formFields,
    validationSchema
};