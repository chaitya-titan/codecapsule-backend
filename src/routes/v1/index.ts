import express from "express";

const fileRoute = require("./files");
const scriptRoute = require("./scripts");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/file",
    route: fileRoute,
  },
  {
    path: "/scripts",
    route: scriptRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
