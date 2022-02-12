const {Op} = require("sequelize");
const Repository = require('./repository');
const Subject = require('../models/subject');
const Page = require('../models/page');

class SubjectRepository extends Repository {
    constructor() {
        super(Subject, Subject.identifier);
    }

    async findAll(eagerLoadPages = false, options = {}) {
        return super.findAll({
            order: [[Subject.columns.position], [Page, Page.columns.position]],
            ...options,
            ...(eagerLoadPages ? {
                include: [
                    Page,
                    ...this._asArray(options.include)
                ]
            } : {})
        });
    }

    async findByPk(identifier, eagerLoadPages = false, options = {}) {
        return super.findByPk(identifier, {
            order: eagerLoadPages ? [[Page, Page.columns.position]] : [],
            ...options,
            ...(eagerLoadPages ? {
                include: [
                    {
                        model: Page
                    },
                    ...this._asArray(options.include)
                ]
            } : {})
        });
    }

    async findAndCountAll(options = {}) {
        return super.findAndCountAll({
            ...options,
            attributes: [
                Subject.identifier,
                Subject.columns.menuName,
                ...this._asArray(options.attributes)
            ]
        });
    }

    async findByPreview(preview = false) {
        return await this.findAll(false, {
            ...(!preview ? {
                where: {
                    [Subject.columns.visible]: true,
                },
            } : {}),
            include: {
                model: Page,
                attributes: [Page.identifier, Page.columns.menuName],
                ...(!preview ? {
                    where: {
                        [Page.columns.visible]: true,
                    },
                } : {}),
            }
        });
    }

    async update(identifier, values, options = {}) {
        return await this.sequelize.transaction(async transaction => {
            const oldInstance = await this.findByPk(identifier, false, {transaction});
            if (oldInstance[Subject.columns.position] !== values[Subject.columns.position]) {
                await super.updateAll({[Subject.columns.position]: oldInstance[Subject.columns.position]}, {
                    where: {
                        [Subject.columns.position]: values[Subject.columns.position]
                    },
                    transaction
                });
            }
            return super.update(identifier, values, {...options, transaction});
        });
    }

    async destroy(identifier, options = {}) {
        return await this.sequelize.transaction(async transaction => {
            const instance = await this.findByPk(identifier, false, {transaction});
            await super.destroy(identifier, {...options, transaction});
            await this.increment({[Subject.columns.position]: -1}, {
                where: {
                    [Subject.columns.position]: {
                        [Op.gt]: instance[Subject.columns.position]
                    }
                },
                transaction
            })
        });
    }
}

module.exports = new SubjectRepository();