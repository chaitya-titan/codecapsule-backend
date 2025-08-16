import { Request, Response } from "express";

const { getAllScripts } = require("../services");

const getScripts = async (req: Request, res: Response) => {
  const scripts = await getAllScripts();
  res.send(scripts);
};

export { getScripts };
