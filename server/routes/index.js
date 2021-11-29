const express = require("express");
const router = express.Router();
const staffRoute = require("./staff");
const { Subject, Page } = require("../models");

module.exports = () => {
  router.get("/", async (req, res, next) => {
    const preview = req.user && req.query.preview;
    const subjects = await Subject.findAll({
      ...(!preview ? {
        where: {
          visible: true,
        },
      } : {}),
      include: {
        model: Page,
        attributes: ["id", "menuName"],
        ...(!preview ? {
          where: {
            visible: true,
          },
        } : {}),
      },
    });
    const subjectId = req.query.subjectId || subjects[0].id;
    const pageId = req.query.id;
    const page = await Page.findOne({
      where: {
        ...(pageId ? { id: pageId } : { subjectId }),
        ...(!preview ? { visible: true } : {}),
      },
      include: {
        model: Subject,
        attributes: ["id", "menuName"],
      },
    });
    if (!page) {
      return res.redirect("/");
    }
    return res.render("staff/index", {
      pageTitle: `${page.menuName}`,
      preview: preview,
      subjects,
      page,
    });
  });

  router.use("/staff", staffRoute());

  return router;
};
