const express = require("express");
const utils = require("../../../utils");
const pageRepo = require('../../../repository/page-repository');
const {validationSchema} = require("../../../validator/page-validator");

module.exports = (options) => {
    const router = express.Router(options);

    router.get("/", async (req, res) => {
        const subjectId = req.params.subjectId;
        res.send(await pageRepo.findBySubject(subjectId));
    });

    router.post("/", utils.validate(validationSchema), async (req, res) => {
        const page = req.formData;
        if (!page.subjectId) {
            page.subjectId = req.params.subjectId;
        }
        res.send(await pageRepo.create(page));
    });

    router.get("/:id", async (req, res) => {
        const pageId = req.params.id;
        res.send(await pageRepo.findByPk(pageId));
    });

    router.put("/:id", utils.validate(validationSchema), async (req, res) => {
        const pageId = req.params.id;
        res.send(await pageRepo.update(pageId, req.formData));
    });

    router.delete("/:id", async (req, res) => {
        const id = req.params.id;
        await pageRepo.destroy(id);
        res.send();
    });

    return router;
};
