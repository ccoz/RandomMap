export function json(payload, init = {}) {
  return Response.json(payload, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init.headers || {})
    }
  });
}

export function errorJson(error) {
  const status = error.statusCode || 500;
  return json(
    {
      error: error.publicMessage || "Unexpected server error",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message
    },
    { status }
  );
}

export function methodNotAllowed(allowedMethods) {
  return json(
    { error: "Method not allowed" },
    {
      status: 405,
      headers: {
        Allow: allowedMethods.join(", ")
      }
    }
  );
}

export async function readJson(request) {
  const text = await request.text();
  if (!text) return {};

  if (text.length > 20_000) {
    const error = new Error("Request body too large");
    error.statusCode = 413;
    error.publicMessage = "Request body too large";
    throw error;
  }

  try {
    return JSON.parse(text);
  } catch {
    const error = new Error("Invalid JSON");
    error.statusCode = 400;
    error.publicMessage = "Invalid JSON body";
    throw error;
  }
}
