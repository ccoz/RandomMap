import { createHealthPayload } from "../lib/billing.mjs";
import { json, methodNotAllowed } from "../lib/vercel-response.mjs";

export function GET() {
  return json(createHealthPayload());
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
