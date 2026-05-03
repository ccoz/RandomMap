import { createHealthPayload } from "../lib/billing.mjs";
import { methodNotAllowed, sendJson } from "../lib/vercel-response.mjs";

export default async function handler(request, response) {
  if (request.method !== "GET") return methodNotAllowed(response, ["GET"]);
  return sendJson(response, 200, createHealthPayload());
}
