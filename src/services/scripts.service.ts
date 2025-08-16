import { getDB } from "../config/db";

const getAllScripts = async () => {
  const db = getDB();
  const scripts = await db.collection("scripts").find().toArray();
  console.log(scripts);

  return scripts;
};

export { getAllScripts };
