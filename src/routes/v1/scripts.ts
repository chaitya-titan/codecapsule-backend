import express from "express";

import { getScripts } from "../../controllers/scripts.controller";

const router = express.Router();

router.get("/", getScripts);

module.exports = router;
