import { Request, Response } from "express";

import { downloadFile } from "../services/downloads.service";

const downloadFileHandler = (req: Request, res: Response) => {
  downloadFile(req.params.execId, res);
};

export { downloadFileHandler };
