import { createHealthPayload } from "../lib/billing.mjs";
import { json, methodNotAllowed } from "../lib/vercel-response.mjs";

export default {
  fetch(request) {
    if (request.method !== "GET") return methodNotAllowed(["GET"]);
    return json(createHealthPayload());
  }
};

export function GET() {
  return json(createHealthPayload());
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
