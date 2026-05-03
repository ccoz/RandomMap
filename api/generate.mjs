import { buildBillingProfile } from "../lib/billing.mjs";
import { errorJson, json, methodNotAllowed, readJson } from "../lib/vercel-response.mjs";

export async function POST(request) {
  try {
    const body = await readJson(request);
    const payload = await buildBillingProfile(body);
    return json(payload);
  } catch (error) {
    return errorJson(error);
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
