import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGeoPayload } from "../lib/billing.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const distDir = path.join(rootDir, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(publicDir, distDir, { recursive: true });
await writeFile(path.join(distDir, "geo.json"), `${JSON.stringify(createGeoPayload())}\n`, "utf8");

console.log(`Built ${path.relative(rootDir, distDir)}`);
