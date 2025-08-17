import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getDB } from "../config/db";
import { Express } from "express";

const spawn = require("cross-spawn");

// --- Python stdlib list (can later move to its own file)
const pythonStdLib = new Set([
  "abc",
  "argparse",
  "asyncio",
  "base64",
  "collections",
  "concurrent",
  "contextlib",
  "copy",
  "csv",
  "datetime",
  "decimal",
  "enum",
  "functools",
  "glob",
  "hashlib",
  "heapq",
  "html",
  "http",
  "io",
  "itertools",
  "json",
  "logging",
  "math",
  "os",
  "pathlib",
  "queue",
  "random",
  "re",
  "shutil",
  "signal",
  "socket",
  "sqlite3",
  "statistics",
  "string",
  "struct",
  "subprocess",
  "sys",
  "tempfile",
  "threading",
  "time",
  "typing",
  "uuid",
  "xml",
  "zipfile",
]);

// --- Utils ---
const createUploadFolder = (execId: string): string => {
  const folder = path.resolve(__dirname, "../../uploads", execId);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  return folder;
};

const moveUploadedFile = (
  file: Express.Multer.File,
  destFolder: string
): string => {
  const ext = path.extname(file.originalname);
  const newFileName = `script${ext}`;
  const destPath = path.join(destFolder, newFileName);

  fs.renameSync(file.path, destPath);
  return newFileName;
};

const extractImports = (filePath: string): string[] => {
  const content = fs.readFileSync(filePath, "utf-8");
  const importRegex = /^\s*(?:from\s+([\w\.]+)|import\s+([\w\.]+))/gm;
  const modules = new Set<string>();
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const moduleName = (match[1] || match[2] || "").split(".")[0];
    if (moduleName) modules.add(moduleName);
  }

  return Array.from(modules);
};

const generateRequirements = (modules: string[], destFolder: string) => {
  const external = modules.filter((m) => !pythonStdLib.has(m));
  if (external.length > 0) {
    fs.writeFileSync(
      path.join(destFolder, "requirements.txt"),
      external.join("\n"),
      "utf-8"
    );
  }
};

const copyBaseFiles = (destFolder: string) => {
  const uploadsRoot = path.resolve(__dirname, "../../uploads");
  ["wrapper.py", "Dockerfile"].forEach((fileName) => {
    const src = path.join(uploadsRoot, fileName);
    const dest = path.join(destFolder, fileName);
    if (fs.existsSync(src)) fs.copyFileSync(src, dest);
  });
};

const insertScriptRecord = async (execId: string, fileName: string) => {
  return getDB().collection("scripts").insertOne({
    execId,
    scriptName: null,
    scriptDesc: null,
    fileName,
    user: null,
    createdAt: new Date(),
  });
};

// --- Main Orchestrator ---
const addFileToUploadFolder = async (files: Express.Multer.File[]) => {
  const execId = uuidv4();
  const destFolder = createUploadFolder(execId);

  const newFileName = moveUploadedFile(files[0], destFolder);

  const scriptPath = path.join(destFolder, newFileName);
  const imports = extractImports(scriptPath);

  generateRequirements(imports, destFolder);
  copyBaseFiles(destFolder);

  await insertScriptRecord(execId, newFileName);

  console.log(`Processing complete for ${execId}`);

  // --- Build Docker image using cross-spawn ---
  const result = spawn.sync("docker", ["build", "-t", `exec_${execId}`, "."], {
    cwd: destFolder,
    stdio: "inherit", // shows build logs in console
  });

  if (result.error) {
    console.error("Docker build failed:", result.error);
    throw result.error;
  }

  console.log(`Docker image built: exec_${execId}`);
};

export { addFileToUploadFolder };
