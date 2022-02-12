const Repository = require('./repository');
const Subject = require('../models/subject');
const Page = require('../models/page');
const {Op} = require("sequelize");
const {options} = require("joi");

class PageRepository extends Repository {
    constructor() {
        super(Page, Page.identifier);
    }

    async findAll(options = {}) {
        return super.findAll({order: [[Page.columns.position]], ...options});
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
                ...(identifier ? {[Page.identifier]: identifier} : subjectIdentifier ? {[Page.columns.subjectId]: subjectIdentifier} : {}),
                ...(!preview ? {[Page.columns.visible]: true} : {})
            },
            include: {
                model: Subject,
                attributes: [Subject.identifier, Subject.columns.menuName]
            },
            order: [[Page.columns.position]]
        });
    }

    async update(identifier, values, options = {}) {
        return this.sequelize.transaction(async transaction => {
            const {
                [Page.columns.position]: oldPosition,
                [Page.columns.subjectId]: oldSubjectId
            } = await this.findByPk(identifier, false, {transaction});
            const {
                [Page.columns.position]: newPosition,
                [Page.columns.subjectId]: newSubjectId
            } = values;
            const isSubjectChanged = oldSubjectId !== newSubjectId;
            if (oldPosition !== newPosition || isSubjectChanged) {
                //Swap if position or subject is changed
                await this.updateAll({
                    [Page.columns.position]: !isSubjectChanged ? oldPosition : await this.count({
                        where: {[Page.columns.subjectId]: newSubjectId},
                        transaction
                    }) + 1
                }, {
                    transaction,
                    where: {
                        [Page.columns.position]: newPosition,
                        [Page.columns.subjectId]: newSubjectId,
                    }
                });
                //Shift old subject's pages only if subject is changed
                if (isSubjectChanged) {
                    await this._shiftPositions(oldPosition, -1, oldSubjectId, {transaction})
                }
            }
            return super.update(identifier, values, {...options, transaction});
        });
    }

    async destroy(identifier, options = {}) {
        return await this.sequelize.transaction(async transaction => {
            const instance = await this.findByPk(identifier, false, {transaction});
            await super.destroy(identifier, {...options, transaction});
            await this._shiftPositions(instance[Page.columns.position], -1, instance[Page.columns.subjectId], {transaction})
        });
    }

    async _shiftPositions(startFrom, stepsCount, groupBySubject, options = {}) {
        return await this.increment({[Page.columns.position]: stepsCount}, {
            ...options,
            where: {
                [Page.columns.position]: {
                    [Op.gt]: startFrom
                },
                [Page.columns.subjectId]: groupBySubject,
                ...options.where
            }
        });
    }
}

module.exports = new PageRepository();