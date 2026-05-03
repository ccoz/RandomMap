import { createGeoPayload } from "../lib/billing.mjs";
import { json, methodNotAllowed } from "../lib/vercel-response.mjs";

export default {
  fetch(request) {
    if (request.method !== "GET") return methodNotAllowed(["GET"]);
    return json(createGeoPayload());
  }
};

export function GET() {
  return json(createGeoPayload());
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
