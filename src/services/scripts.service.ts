import { getDB } from "../config/db";

const getAllScripts = async () => {
  const db = getDB();
  const scripts = await db.collection("scripts").find().toArray();

  return scripts;
};

export { getAllScripts };
