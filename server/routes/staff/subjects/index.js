const express = require("express");
const Joi = require("joi");
const utils = require("../../../utils");
const { Subject, Page } = require("../../../models");
const pageRoute = require("./pages");

const schema = Joi.object({
  menuName: Joi.string().min(3).max(30).required(),
  position: Joi.number().integer().min(1).required(),
  visible: Joi.boolean().default(false),
});

module.exports = (options) => {
  const router = express.Router(options);

  router.get("/", async (req, res, next) => {
    const subjects = await Subject.findAll({ include: Page });
    res.render("subjects/index", { pageTitle: "Subjects", subjects });
  });

  router.get("/new", async (req, res, next) => {
    const subjectsCount = (await Subject.count()) + 1;
    const formData = req.formData || {};
    const subject = {
      menuName: formData.menuName || "",
      position: formData.position || subjectsCount,
      visible: !!formData.visible,
    };
    return res.render("subjects/new", {
      pageTitle: "New Subject",
      subject,
      subjectsCount,
    });
  });

  router.post("/new", utils.validate(schema), async (req, res, next) => {
    const formData = req.formData;
    const subject = {
      menuName: formData.menuName,
      position: formData.position,
      visible: formData.visible,
    };
    await Subject.create(subject);
    return res.redirect("/staff/subjects");
  });

  router.get("/show/:id", async (req, res, next) => {
    const subject = await Subject.findByPk(req.params.id, { include: Page });
    const subjectsCount = await Subject.count();
    return res.render("subjects/show", {
      pageTitle: "Show Subject",
      subject,
      subjectsCount,
    });
  });

  router.get("/edit/:id", async (req, res, next) => {
    const id = req.params.id;
    const formData = req.formData || (await Subject.findByPk(id));
    const subjectsCount = await Subject.count();
    const subject = {
      id,
      menuName: formData.menuName || "",
      position: formData.position || subjectsCount + 1,
      visible: !!formData.visible,
    };
    return res.render("subjects/edit", {
      pageTitle: "Edit Subject",
      subject,
      subjectsCount,
    });
  });

  router.post("/edit/:id", utils.validate(schema), async (req, res, next) => {
    const id = req.params.id;
    const formData = req.formData;
    const subject = await Subject.findByPk(id);
    subject.setDataValue("menuName", formData.menuName);
    subject.setDataValue("position", formData.position);
    subject.setDataValue("visible", formData.visible);
    await subject.save();
    return res.redirect(`/staff/subjects/show/${id}`);
  });

  router.get("/delete/:id", async (req, res, next) => {
    const subject = await Subject.findByPk(req.params.id);
    return res.render("subjects/delete", {
      pageTitle: "Delete Subject",
      subject,
    });
  });

  router.post("/delete/:id", (req, res, next) => {
    const id = req.params.id;
    Subject.destroy({
      where: {
        id,
      },
    });
    return res.redirect("/staff/subjects");
  });

  router.use("/:subjectId/pages", pageRoute({ mergeParams: true }));

  return router;
};
