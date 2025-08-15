import express from "express";

const fileRoute = require("./files");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/file",
    route: fileRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
