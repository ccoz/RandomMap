import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildBillingProfile, createGeoPayload, createHealthPayload } from "./lib/billing.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");

loadLocalEnv();

const PORT = parsePort(process.env.PORT, 5173);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, createHealthPayload());
    }

    if (req.method === "GET" && url.pathname === "/api/geo") {
      return sendJson(res, 200, createGeoPayload());
    }

    if (req.method === "POST" && url.pathname === "/api/generate") {
      const body = await readJson(req);
      const payload = await buildBillingProfile(body);
      return sendJson(res, 200, payload);
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      return sendJson(res, 405, { error: "Method not allowed" });
    }

    return serveStatic(url.pathname, res);
  } catch (error) {
    sendError(res, error);
  }
});

let activePort = PORT;
let portAttempts = 0;

server.on("listening", () => {
  console.log(`RandomMap is running at http://localhost:${activePort}`);
  console.log("Google Maps API key source: browser input only");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && portAttempts < 20) {
    portAttempts += 1;
    const nextPort = activePort + 1;
    console.warn(`Port ${activePort} is already in use. Trying ${nextPort}...`);
    activePort = nextPort;
    server.listen(activePort);
    return;
  }

  console.error(error.message);
  process.exit(1);
});

server.listen(activePort);

function parsePort(value, fallback) {
  const port = Number(value || fallback);
  if (Number.isInteger(port) && port > 0 && port < 65536) return port;
  return fallback;
}

function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function readJson(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 20_000) {
      const error = new Error("Request body too large");
      error.statusCode = 413;
      error.publicMessage = "Request body too large";
      throw error;
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Invalid JSON");
    error.statusCode = 400;
    error.publicMessage = "Invalid JSON body";
    throw error;
  }
}

async function serveStatic(pathname, res) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(publicDir, cleanPath));

  if (!filePath.startsWith(publicDir)) {
    return sendJson(res, 403, { error: "Forbidden" });
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(await readFile(filePath));
  } catch {
    const fallback = path.join(publicDir, "index.html");
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[".html"],
      "Cache-Control": "no-store"
    });
    res.end(await readFile(fallback));
  }
}

function sendError(res, error) {
  const status = error.statusCode || 500;
  sendJson(res, status, {
    error: error.publicMessage || "Unexpected server error",
    detail: process.env.NODE_ENV === "production" ? undefined : error.message
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}
