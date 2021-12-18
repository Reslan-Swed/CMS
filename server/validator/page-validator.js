const Joi = require('joi');
const Page = require('../models/page');

const formFields = {
    menuName: Page.columns.menuName,
    position: Page.columns.position,
    visible: Page.columns.visible,
    content: Page.columns.content,
    subjectId: Page.columns.subjectId
};

const validationSchema = Joi.object({
    [formFields.menuName]: Joi.string().min(3).max(30).required(),
    [formFields.position]: Joi.number().integer().min(1).required(),
    [formFields.visible]: Joi.boolean().default(false),
    [formFields.content]: Joi.string().required(),
    [formFields.subjectId]: Joi.number().integer(),
});

module.exports = {
    formFields,
    validationSchema
};