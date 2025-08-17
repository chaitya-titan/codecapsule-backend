import express from "express";

import { downloadFileHandler } from "../../controllers/downloads.controller";

const router = express.Router();

router.get("/:execId", downloadFileHandler);

module.exports = router;
