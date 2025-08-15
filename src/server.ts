import express from "express";
import { Request, Response, Express } from "express";
import { connectDB, getDB } from "./config/db";

const app: Express = express();
const PORT = 5001;

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  const result = await getDB()
    .collection("users")
    .insertOne({ hello: "world" });
  res.send("Hello World");
});

app.listen(PORT, async () => {
  await connectDB();
  console.log("Server is running on port ", PORT);
});
