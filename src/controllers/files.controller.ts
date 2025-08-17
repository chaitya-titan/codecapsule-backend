import { Request, Response } from "express";

import { addFileToUploadFolder } from "../services/files.service";

const fileUpload = (req: Request, res: Response) => {
  if (Array.isArray(req.files) && req.files.length > 0) {
    addFileToUploadFolder(req.files);
    res.sendStatus(200);
  } else {
    res.status(400).send("No files uploaded");
  }
};

export { fileUpload };
