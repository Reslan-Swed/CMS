const express = require("express");
const utils = require("../../../utils");
const {validationSchema} = require("../../../validator/subject-validator");
const subjectRepo = require('../../../repository/subject-repository');
const pageRouter = require('./page');

module.exports = (options) => {
    const router = express.Router(options);

    router.get("/", async (req, res) => {
        res.send(await subjectRepo.findAll());
    });

    router.post("/", utils.validate(validationSchema), async (req, res) => {
        const subject = req.formData;
        res.send(await subjectRepo.create(subject));
    });

    router.get("/:id", async (req, res) => {
        res.send(await subjectRepo.findByPk(req.params.id));
    });

    router.put("/:id", utils.validate(validationSchema), async (req, res) => {
        const id = req.params.id;
        const subject = req.formData;
        res.send(await subjectRepo.update(id, subject));
    });

    router.delete("/:id", async (req, res) => {
        const id = req.params.id;
        await subjectRepo.destroy(id);
        res.send();
    });

    router.use("/:subjectId/pages", pageRouter({mergeParams: true}));

    return router;
};
