const express = require("express");
const Joi = require("joi");
const utils = require("../../../../utils");
const { Subject, Page } = require("../../../../models");

const schema = Joi.object({
  menuName: Joi.string().min(3).max(30).required(),
  position: Joi.number().integer().min(1).required(),
  visible: Joi.boolean().default(false),
  content: Joi.string().required(),
  subjectId: Joi.number().integer().required(),
});

module.exports = (options) => {
  const router = express.Router(options);

  router.get("/new", async (req, res, next) => {
    const subjectId = req.params.subjectId;
    const pagesCount =
      (await Page.count({
        where: {
          subjectId,
        },
      })) + 1;
    const formData = req.formData || {};
    const page = {
      menuName: formData.menuName || "",
      position: formData.position || pagesCount,
      visible: !!formData.visible,
      content: formData.content || "",
      subjectId,
    };
    return res.render("pages/new", { pageTitle: "New Page", page, pagesCount });
  });

  router.post("/new", utils.validate(schema), async (req, res, next) => {
    const page = req.formData;
    await Page.create(page);
    return res.redirect(`/staff/subjects/show/${page.subjectId}`);
  });

  router.get("/show/:id", async (req, res, next) => {
    const pageId = req.params.id;
    const page = await Page.findByPk(pageId, {
      include: {
        model: Subject,
        attributes: ["id", "menuName"],
      },
    });
    return res.render("pages/show", { pageTitle: "Show Page", page });
  });

  router.get("/edit/:id", async (req, res, next) => {
    const pageId = req.params.id;
    const page = req.formData || (await Page.findByPk(pageId));
    const { rows: subjects, count: subjectsCount } =
      await Subject.findAndCountAll({
        attributes: ["id", "menuName"],
      });
    const pagesCount = await Page.count({
      where: {
        subjectId: page.subjectId,
      },
    });
    return res.render("pages/edit", {
      pageTitle: "Show Page",
      page,
      pagesCount,
      subjects,
      subjectsCount,
    });
  });

  router.post("/edit/:id", utils.validate(schema), async (req, res, next) => {
    const pageId = req.params.id;
    const formData = req.formData;
    const page = await Page.findByPk(pageId);
    page.setDataValue("menuName", formData.menuName);
    page.setDataValue("position", formData.position);
    page.setDataValue("visible", formData.visible);
    page.setDataValue("content", formData.content);
    page.setDataValue("subjectId", formData.subjectId);
    await page.save();
    return res.redirect(
      `/staff/subjects/${page.subjectId}/pages/show/${pageId}`
    );
  });

  router.get("/delete/:id", async (req, res, next) => {
    const id = req.params.id;
    const page = await Page.findByPk(id);
    return res.render("pages/delete", {
      pageTitle: "Show Page",
      page,
    });
  });

  router.post("/delete/:id", async (req, res, next) => {
    const id = req.params.id;
    const subjectId = req.params.subjectId;
    await Page.destroy({
      where: {
        id,
      },
    });
    return res.redirect(`/staff/subjects/show/${subjectId}`);
  });

  return router;
};
