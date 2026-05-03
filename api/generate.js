import { buildBillingProfile } from "../lib/billing.mjs";
import { errorJson, methodNotAllowed, readJson } from "../lib/vercel-response.mjs";

export default {
  async fetch(request) {
    if (request.method !== "POST") return methodNotAllowed(["POST"]);
    return handleGenerate(request);
  }
};

export async function POST(request) {
  return handleGenerate(request);
}

export function GET() {
  return methodNotAllowed(["POST"]);
}

async function handleGenerate(request) {
  try {
    const body = await readJson(request);
    const payload = await buildBillingProfile(body);
    return Response.json(payload, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return errorJson(error);
  }
}
