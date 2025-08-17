import fs from "fs";
import path from "path";
import archiver from "archiver";
import { Response } from "express";

export const downloadFile = (execId: string, res: Response) => {
  const folderPath = path.join(__dirname, "../../generated", execId);

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ error: "Folder not found" });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${execId}.zip"`);

  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => {
    console.error(err);
    res.status(500).end();
  });

  // Pipe archive data to the response (streaming directly to browser)
  archive.pipe(res);

  // Append all files from the generated folder
  archive.directory(folderPath, false);

  archive.finalize();
};
