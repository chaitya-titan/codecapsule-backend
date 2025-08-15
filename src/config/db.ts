import { MongoClient, Db } from "mongodb";
const dotenv = require("dotenv");

dotenv.config();

let db: Db;

export const connectDB = async () => {
  const client = new MongoClient(process.env.MONGO_URI as string);
  await client.connect();
  db = client.db(process.env.MONGO_DB);
  console.log(`Connected to MongoDB`);
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};
