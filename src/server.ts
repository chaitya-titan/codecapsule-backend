import express from "express";
import { Request, Response, Express } from "express";
import { connectDB, getDB } from "./config/db";

import multer from "multer";

const cors = require("cors");
const routes = require("./routes/v1");

const app: Express = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());
const upload = multer({ dest: "../uploads" });

app.use("/api/v1", upload.array("files"), routes);

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
