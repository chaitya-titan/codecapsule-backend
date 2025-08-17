import { Request, Response } from "express";
import { getAllScripts } from "../services/scripts.service";

const getScripts = async (req: Request, res: Response) => {
  const scripts = await getAllScripts();
  res.send(scripts);
};

export { getScripts };
