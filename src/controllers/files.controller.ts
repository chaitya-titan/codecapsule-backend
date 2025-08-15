import { Request, Response } from "express";

const { addFileToUploadFolder } = require("../services");

const fileUpload = (req: Request, res: Response) => {
  addFileToUploadFolder(req.files);
  res.send(200);
};

export { fileUpload };
