import { buildBillingProfile } from "../lib/billing.mjs";
import { methodNotAllowed, readRequestBody, sendError, sendJson } from "../lib/vercel-response.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") return methodNotAllowed(response, ["POST"]);

  try {
    const body = readRequestBody(request);
    const payload = await buildBillingProfile(body);
    return sendJson(response, 200, payload);
  } catch (error) {
    return sendError(response, error);
  }
}
