import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGeoPayload } from "../lib/billing.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const outputPath = path.join(publicDir, "geo.json");

await mkdir(publicDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(createGeoPayload())}\n`, "utf8");
console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
