const Repository = require('./repository');
const Subject = require('../models/subject');
const Page = require('../models/page');

class SubjectRepository extends Repository {
    constructor() {
        super(Subject, Subject.identifier);
    }

    async findAll(eagerLoadPages = false, options = {}) {
        return super.findAll({
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
            ...options,
            ...(eagerLoadPages ? {
                include: [
                    Page,
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
}

module.exports = new SubjectRepository();