/* Service layer for calling the Planie backend (Firebase Functions,
   europe-west1). All portal calls go through callFunction so auth headers and
   error shaping live in one place — pages never fetch() directly. */

import { auth, USE_EMULATORS } from "./firebaseClient";

const FUNCTIONS_BASE = USE_EMULATORS
  ? "http://127.0.0.1:5001/planie-app-project/europe-west1"
  : "https://europe-west1-planie-app-project.cloudfunctions.net";

export class ApiError extends Error {
  constructor(message, { status, code, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? 0;
    this.code = code ?? null;
    this.data = data ?? null; // full error body (e.g. PROMO_CONFLICT carries `conflict`)
  }
}

/* Calls an individual onRequest function (e.g. "partnerGetProfile").
   Attaches the signed-in user's ID token as a Bearer header. */
export async function callFunction(name, body, { method = "POST", requireUser = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  const user = auth.currentUser;
  if (user) {
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  } else if (requireUser) {
    throw new ApiError("Not signed in.", { status: 401, code: "NO_USER" });
  }

  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method,
    headers,
    body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON error body */
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, {
      status: res.status,
      code: data?.code,
      data,
    });
  }
  return data;
}

/* Calls a route on the shared Express `api` function (e.g. "/partner-program"). */
export async function callApiRoute(path, body, opts = {}) {
  return callFunction(`api${path.startsWith("/") ? path : `/${path}`}`, body, {
    requireUser: false,
    ...opts,
  });
}
