import { WebSocketServer } from "ws";
import http from "http";

const readline = require("readline");
const spawn = require("cross-spawn");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const initWebSocket = (server: http.Server) => {
  const wss = new WebSocketServer({ port: 8000 });

  server.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith("/ws/")) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy(); // not a WS request
    }
  });

  //   wss.on("connection", (ws) => console.log("WS connected!"));

  wss.on("connection", async (ws, request) => {
    // Extract execId from URL
    console.log("request", request.url);

    const execId = await request.url?.split("/").pop();
    await console.log(`WebSocket connected for ${request.url}: ${execId}`);

    // === START DOCKER CONTAINER FOR THIS WS CONNECTION ===
    if (!execId) return;
    if (!request.url?.includes("/container/")) {
      connectContainer(execId, ws);
    }

    ws.on("close", () => {
      console.log(`WebSocket disconnected for execId: ${execId}`);
    });
  });

  return wss;
};

const containerProcesses: Record<string, any> = {};

export const connectContainer = (execId: string, ws: any) => {
  const args = [
    "run",
    "--rm",
    "-i",
    "-e",
    `EXEC_ID=${execId}`,
    "-v",
    `${process.cwd()}/uploads/${execId}:/app`,
    "-v",
    `${process.cwd()}/generated/${execId}:/generated/${execId}`,
    `exec_${execId}`,
  ];

  console.log(`Starting container for execId: ${execId}...`);

  const child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });
  containerProcesses[execId] = child;

  // --- STDOUT from container ---
  child.stdout.on("data", (data: Buffer) => {
    const messages = data.toString().split("\n");
    messages.forEach((msg) => {
      if (!msg.trim()) return;

      if (msg.startsWith("__PROMPT__")) {
        const promptText = msg.replace("__PROMPT__", "");

        // Tell frontend to show input box
        ws.send(JSON.stringify({ type: "prompt", text: promptText }));
      } else {
        // Send normal output to frontend

        ws.send(JSON.stringify({ type: "output", text: msg }));
      }
    });
  });

  // --- STDERR ---
  child.stderr.on("data", (data: Buffer) => {
    ws.send(JSON.stringify({ type: "error", text: data.toString() }));
  });

  // --- EXIT ---
  ws.on("close", () => {
    console.log(`WebSocket disconnected for execId: ${execId}`);

    const child = containerProcesses[execId];
    if (child) {
      try {
        console.log(
          `[Container ${execId}] Killing because WebSocket closed abruptly...`
        );
        child.kill("SIGKILL"); // kill the docker process
      } catch (err) {
        console.error(`Error killing container process for ${execId}:`, err);
      }
      delete containerProcesses[execId];
    }
  });

  child.on("close", (code: number) => {
    console.log(`[Container ${execId}] exited with code ${code}`);

    try {
      child.stdin.end();
    } catch (e) {
      console.error("Failed to close stdin:", e);
    }

    ws.send(JSON.stringify({ type: "exit", code }));
    delete containerProcesses[execId];
  });

  // --- Handle messages from frontend ---
  ws.on("message", (message: string) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === "input") {
        child.stdin.write(parsed.value + "\n");
      }
    } catch (e) {
      console.error("Invalid message from frontend:", message.toString());
    }
  });
};
