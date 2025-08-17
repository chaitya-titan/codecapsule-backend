import express from "express";

const fileRoute = require("./files");
const scriptRoute = require("./scripts");
const downloadRoute = require("./downloads");

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
  {
    path: "/downloads",
    route: downloadRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
