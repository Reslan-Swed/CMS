const express = require("express");
const _ = require("lodash");
const utils = require("../../utils");
const pageRepo = require('../../repository/page-repository');
const subjectRepo = require('../../repository/subject-repository');
const {formFields, validationSchema} = require("../../validator/page-validator");

module.exports = (options) => {
  const router = express.Router(options);

  router.get("/new", async (req, res, next) => {
    const subjectId = req.params.subjectId;
    const subject = (await subjectRepo.findByPk(req.params.subjectId));
    const pagesCount = (await pageRepo.subjectPagesCount(subjectId)) + 1;
    const formData = req.formData || {};
    const page = {
      [formFields.menuName]: formData[formFields.menuName] || "",
      [formFields.position]: formData[formFields.position] || pagesCount,
      [formFields.visible]: !!formData[formFields.visible],
      [formFields.content]: formData[formFields.content] || "",
      [formFields.subjectId]: subjectId,
    };
    return res.render("pages/new", { pageTitle: "New Page", page, pagesCount, subject });
  });

  router.post("/new", utils.validate(validationSchema), async (req, res, next) => {
    const page = req.formData;
    await pageRepo.create(page);
    return res.redirect(`/staff/subjects/show/${page[formFields.subjectId]}`);
  });

  router.get("/show/:id", async (req, res, next) => {
    const pageId = req.params.id;
    const page = await pageRepo.findByPk(pageId);
    return res.render("pages/show", { pageTitle: "Show Page", page });
  });

  router.get("/edit/:id", async (req, res, next) => {
    const pageId = req.params.id;
    const page = req.formData || (await pageRepo.findByPk(pageId));
    const { rows: subjects, count: subjectsCount } = await subjectRepo.findAndCountAll();
    const pagesCount = await pageRepo.subjectPagesCount(page.subjectId);
    return res.render("pages/edit", {
      pageTitle: "Show Page",
      page,
      pagesCount,
      subjects,
      subjectsCount,
    });
  });

  router.post("/edit/:id", utils.validate(validationSchema), async (req, res, next) => {
    const pageId = req.params.id;
    const page = await pageRepo.update(pageId, req.formData);
    return res.redirect(
      `/staff/subjects/${page[formFields.subjectId]}/pages/show/${pageId}`
    );
  });

  router.get("/delete/:id", async (req, res, next) => {
    const id = req.params.id;
    const page = await pageRepo.findByPk(id);
    return res.render("pages/delete", {
      pageTitle: "Show Page",
      page,
    });
  });

  router.post("/delete/:id", async (req, res, next) => {
    const id = req.params.id;
    const subjectId = req.params.subjectId;
    await pageRepo.destroy(id);
    return res.redirect(`/staff/subjects/show/${subjectId}`);
  });

  router.get('/count', async (req, res) => {
    const subjectId = req.params.subjectId;
    res.json({
      subject: {
        id: subjectId,
        totalPages: await pageRepo.count({where: {subjectId}})
      }
    });
  });

  return router;
};
