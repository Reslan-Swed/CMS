const express = require("express");
const _ = require("lodash");
const utils = require("../../utils");
const {formFields, validationSchema} = require("../../validator/subject-validator");
const subjectRepo = require('../../repository/subject-repository');
const pageRouter = require("./page");

module.exports = (options) => {
    const router = express.Router(options);

    router.get("/", async (req, res, next) => {
        const subjects = await subjectRepo.findAll(true);
        res.render("subjects/index", {pageTitle: "Subjects", subjects});
    });

    router.get("/new", async (req, res, next) => {
        const subjectsCount = await subjectRepo.count();
        const formData = req.formData || {};
        const subject = {
            [formFields.menuName]: formData[formFields.menuName] || "",
            [formFields.position]: formData[formFields.position] || subjectsCount + 1,
            [formFields.visible]: !!formData[formFields.visible],
        };
        return res.render("subjects/new", {
            pageTitle: "New Subject",
            subject,
            subjectsCount,
        });
    });

    router.post("/new", utils.validate(validationSchema), async (req, res, next) => {
        const subject = req.formData;
        await subjectRepo.create(subject);
        return res.redirect("/staff/subjects");
    });

    router.get("/show/:id", async (req, res, next) => {
        const subject = await subjectRepo.findByPk(req.params.id, true);
        const subjectsCount = await subjectRepo.count();
        return res.render("subjects/show", {
            pageTitle: "Show Subject",
            subject,
            subjectsCount,
        });
    });

    router.get("/edit/:id", async (req, res, next) => {
        const id = req.params.id;
        const subject = req.formData
            || (await subjectRepo.findByPk(id, true));
        const subjectsCount = await subjectRepo.count();
        return res.render("subjects/edit", {
            pageTitle: "Edit Subject",
            subject,
            subjectsCount,
        });
    });

    router.post("/edit/:id", utils.validate(validationSchema), async (req, res, next) => {
        const id = req.params.id;
        const subject = req.formData;
        await subjectRepo.update(id, subject);
        return res.redirect(`/staff/subjects/show/${id}`);
    });

    router.get("/delete/:id", async (req, res, next) => {
        const subject = await subjectRepo.findByPk(req.params.id);
        return res.render("subjects/delete", {
            pageTitle: "Delete Subject",
            subject,
        });
    });

    router.post("/delete/:id", async (req, res, next) => {
        const id = req.params.id;
        await subjectRepo.destroy(id);
        return res.redirect("/staff/subjects");
    });

    router.use("/:subjectId/pages", pageRouter({mergeParams: true}));

    return router;
};
