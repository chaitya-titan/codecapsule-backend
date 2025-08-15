import { Express } from "express";

const addFileToUploadFolder = (file: Express.Multer.File) => {
  console.log("in service", file);
};

export { addFileToUploadFolder };
