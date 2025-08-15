import express from "express";

import { fileUpload } from "../../controllers/files.controller";

const router = express.Router();

router.post("/upload", fileUpload);

module.exports = router;
