export function sendJson(response, status, payload, headers = {}) {
  response.status(status);

  for (const [key, value] of Object.entries({
    "Cache-Control": "no-store",
    ...headers
  })) {
    response.setHeader(key, value);
  }

  response.json(payload);
}

export function sendError(response, error) {
  const status = error.statusCode || 500;
  console.error(error);
  sendJson(response, status, {
    error: error.publicMessage || "Unexpected server error",
    detail: error.message || "Unknown error"
  });
}

export function methodNotAllowed(response, allowedMethods) {
  sendJson(
    response,
    405,
    { error: "Method not allowed" },
    { Allow: allowedMethods.join(", ") }
  );
}

export function readRequestBody(request) {
  const body = request.body;
  if (!body) return {};

  if (typeof body === "object" && !Buffer.isBuffer(body)) {
    return body;
  }

  if (typeof body === "string") {
    if (body.length > 20_000) {
      const error = new Error("Request body too large");
      error.statusCode = 413;
      error.publicMessage = "Request body too large";
      throw error;
    }

    try {
      return JSON.parse(body);
    } catch {
      const error = new Error("Invalid JSON");
      error.statusCode = 400;
      error.publicMessage = "Invalid JSON body";
      throw error;
    }
  }

  const error = new Error("Unsupported request body");
  error.statusCode = 400;
  error.publicMessage = "Unsupported request body";
  throw error;
}
