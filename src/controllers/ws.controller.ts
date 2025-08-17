import http from "http";

const { initWebSocket } = require("../services");

let wss: ReturnType<typeof initWebSocket>;

export const setupWebSocket = (server: http.Server) => {
  wss = initWebSocket(server);
};

export const getWSS = () => wss;
