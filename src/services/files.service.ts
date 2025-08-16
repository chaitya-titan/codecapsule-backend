import fs from "fs";
import path from "path";
import { getDB } from "../config/db";
import { v4 as uuidv4 } from "uuid";

import { Express } from "express";

const addFileToUploadFolder = (file: Express.Multer.File[]) => {
  //TODO: Fail first... if file moving failed, the insertOne operation should not run itself

  const execId = uuidv4();
  const destinationFolder = path.resolve(__dirname, "../../uploads", execId);

  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder, { recursive: true });
  }

  const ext = path.extname(file[0].originalname);
  const newFileName = `script${ext}`;
  const destPath = path.join(destinationFolder, newFileName);

  fs.rename(file[0].path, destPath, (err) => {
    if (err) {
      console.error("Error moving file:", err);
    } else {
      console.log(`File renamed and moved to ${destPath}`);
    }
  });

  const result = getDB().collection("scripts").insertOne({
    execId,
    scriptName: null,
    scriptDesc: null,
    fileName: newFileName,
    user: null,
    createdAt: new Date(),
  });
};

export { addFileToUploadFolder };
