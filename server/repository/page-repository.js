const Repository = require('./repository');
const Subject = require('../models/subject');
const Page = require('../models/page');

class PageRepository extends Repository {
    constructor() {
        super(Page, Page.identifier);
    }

    async subjectPagesCount(subjectId) {
        return super.count({
            where: {
                subjectId,
            }
        });
    }

    async findBySubject(subjectId) {
        return super.findAll({
            where: {
                subjectId
            }
        });
    }

    async findByPk(identifier, options = {}) {
        return super.findByPk(identifier, {
            ...options,
            include: [
                {
                    model: Subject,
                    attributes: [Subject.identifier, Subject.columns.menuName],
                },
                ...this._asArray(options.include)
            ]
        });
    }

    async findByPreviewAndPKorElseFirstBySubject(identifier, subjectIdentifier, preview = false) {
        return await this.findOne({
            where: {
                ...(identifier ? { [Page.identifier]: identifier } : subjectIdentifier ? { [Page.columns.subjectId]: subjectIdentifier } : {}),
                ...(!preview ? { [Page.columns.visible]: true } : {})
            },
            include: {
                model: Subject,
                attributes: [Subject.identifier, Subject.columns.menuName]
            }
        });
    }
}

module.exports = new PageRepository();