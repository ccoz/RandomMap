import { createGeoPayload } from "../lib/billing.mjs";
import { json, methodNotAllowed } from "../lib/vercel-response.mjs";

export function GET() {
  return json(createGeoPayload());
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
