import http from "http";

import { initWebSocket } from "../services/ws.service";

let wss: ReturnType<typeof initWebSocket>;

export const setupWebSocket = (server: http.Server) => {
  wss = initWebSocket(server);
};

export const getWSS = () => wss;
