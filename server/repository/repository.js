const _ = require('lodash');
const sequelize = require('../service/db').connection;

class Repository {
    constructor(model, identifier) {
        this.model = model;
        this.identifier = identifier;
    }

    get sequelize() {
        return sequelize();
    }

    async findAll(options = {}) {
        return this.model.findAll(options);
    }

    async count(options = {}) {
        return this.model.count(options);
    }

    async create(values) {
        return this.model.create(values);
    }

    async findByPk(identifier, options = {}) {
        return this.model.findByPk(identifier, options);
    }

    async findAndCountAll(options = {}) {
        return this.model.findAndCountAll(options);
    }

    async findOne(options = {}) {
        return this.model.findOne(options);
    }

    async update(identifier, values, options = {}) {
        await this.updateAll(values, {
            ...options,
            where: {
                [this.identifier]: identifier,
                ...options.where,
            }
        });
        return this.findByPk(identifier, options);
    }

    async updateAll(values, options = {}) {
        return this.model.update(values, options);
    }

    async increment(values, options = {}) {
        return this.model.increment(values, options);
    }

    async destroy(identifier, options = {}) {
        return this.model.destroy({
            ...options,
            where: {
                [this.identifier]: identifier,
                ...options.where,
            }
        });
    }

    _asArray(value) {
        return _.isUndefined(value) ? [] : _.isArray(value) ? value : [value]
    }
}

module.exports = Repository;