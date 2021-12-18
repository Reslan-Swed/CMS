const _ = require('lodash');

class Repository {
    constructor(model, identifier) {
        this.model = model;
        this.identifier = identifier;
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
        const instance = await this.findByPk(identifier, options);
        _.forIn(values, (value, key) => {
            instance.setDataValue(key, value);
        });
        return instance.save();
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