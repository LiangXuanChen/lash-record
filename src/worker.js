const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const STATE_COOKIE = "lash_oauth_state";
const SESSION_COOKIE = "lash_session";
const SESSION_TTL = 8 * 60 * 60;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/health") {
        return withCors(await healthCheck(env), request, env);
      }
      if (url.pathname === "/api/auth/me") {
        if (request.method === "OPTIONS") {
          return withCors(new Response(null, { status: 204 }), request, env);
        }
        if (request.method !== "GET") {
          return withCors(jsonError("Method not allowed", 405), request, env);
        }
        return withCors(await currentUser(request, env), request, env);
      }
      if (url.pathname === "/api/profile") {
        if (request.method === "OPTIONS") {
          return withCors(new Response(null, { status: 204 }), request, env);
        }
        if (request.method === "GET") {
          return withCors(await currentUser(request, env), request, env);
        }
        if (request.method === "PATCH") {
          return withCors(await updateProfile(request, env), request, env);
        }
        return withCors(jsonError("Method not allowed", 405), request, env);
      }
      if (url.pathname === "/auth/google" && request.method === "GET") {
        return startGoogleLogin(url, env);
      }
      if (url.pathname === "/auth/google/callback" && request.method === "GET") {
        return finishGoogleLogin(request, url, env);
      }
      if (
        url.pathname === "/auth/logout" &&
        (request.method === "GET" || request.method === "POST")
      ) {
        return logout(env);
      }

      return new Response("Lash Record API");
    } catch (error) {
      console.error("Unhandled Worker error", error);
      return jsonError("Internal server error", 500);
    }
  }
};

async function healthCheck(env) {
  const result = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM AppUser"
  ).first();

  return Response.json({
    ok: true,
    database: "connected",
    appUserCount: result?.count ?? 0
  });
}

function startGoogleLogin(url, env) {
  if (!authIsConfigured(env)) {
    return authError("Google login is not configured yet.", 503);
  }

  const state = randomToken(32);
  const redirectUri = `${url.origin}/auth/google/callback`;
  const authorizationUrl = new URL(GOOGLE_AUTH_URL);

  authorizationUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("prompt", "select_account");

  return redirect(authorizationUrl, [
    makeCookie(STATE_COOKIE, state, 10 * 60, "/auth/google", "Lax")
  ]);
}

async function finishGoogleLogin(request, url, env) {
  const clearState = makeCookie(STATE_COOKIE, "", 0, "/auth/google", "Lax");

  if (url.searchParams.has("error")) {
    return authError("Google login was cancelled or denied.", 400, clearState);
  }

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const savedState = getCookie(request, STATE_COOKIE);

  if (!code || !returnedState || !savedState || returnedState !== savedState) {
    return authError("Invalid or expired login request.", 400, clearState);
  }
  if (!authIsConfigured(env)) {
    return authError("Google login is not configured yet.", 503, clearState);
  }

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${url.origin}/auth/google/callback`,
      grant_type: "authorization_code"
    })
  });

  if (!tokenResponse.ok) {
    console.error("Google token exchange failed", tokenResponse.status);
    return authError("Google login could not be completed.", 502, clearState);
  }

  const tokens = await tokenResponse.json();
  const profileResponse = tokens.access_token
    ? await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      })
    : null;

  if (!profileResponse?.ok) {
    console.error("Google profile request failed", profileResponse?.status);
    return authError("Google profile could not be verified.", 502, clearState);
  }

  const profile = await profileResponse.json();
  if (!profile.sub || !profile.email || profile.email_verified !== true) {
    return authError("A verified Google email address is required.", 403, clearState);
  }

  const user = await findAuthorizedUser(env, profile.sub, profile.email);
  if (!user || user.IsActive !== 1) {
    return authError("This Google account is not authorized.", 403, clearState);
  }
  if (user.GoogleSubject && user.GoogleSubject !== profile.sub) {
    return authError("This email is linked to another Google account.", 403, clearState);
  }

  if (!user.GoogleSubject) {
    try {
      await env.DB.prepare(
        `UPDATE AppUser
         SET GoogleSubject = ?, Modifier = UserId, ModifiedDate = ?
         WHERE UserId = ? AND GoogleSubject IS NULL`
      )
        .bind(profile.sub, taipeiTimestamp(), user.UserId)
        .run();
    } catch (error) {
      console.error("Google account linking failed", error);
      return authError("This Google account could not be linked.", 409, clearState);
    }
  }

  const session = await createSession(
    {
      userId: user.UserId,
      googleSubject: profile.sub,
      email: user.Email,
      displayName: user.DisplayName
    },
    env.SESSION_SECRET
  );

  return redirect(frontendUrl(env), [
    clearState,
    makeCookie(SESSION_COOKIE, session, SESSION_TTL, "/", "None")
  ]);
}

async function findAuthorizedUser(env, googleSubject, email) {
  const columns = "UserId, GoogleSubject, Email, DisplayName, IsActive";
  const linkedUser = await env.DB.prepare(
    `SELECT ${columns} FROM AppUser WHERE GoogleSubject = ? LIMIT 1`
  )
    .bind(googleSubject)
    .first();

  if (linkedUser) {
    return linkedUser;
  }

  return env.DB.prepare(
    `SELECT ${columns} FROM AppUser WHERE lower(Email) = lower(?) LIMIT 1`
  )
    .bind(email)
    .first();
}

async function currentUser(request, env) {
  const user = await authenticatedUser(request, env);

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  return Response.json({
    authenticated: true,
    user: userResponse(user)
  });
}

async function updateProfile(request, env) {
  if (!isAllowedOrigin(request, env)) {
    return jsonError("Forbidden", 403);
  }
  if (!(request.headers.get("Content-Type") || "").startsWith("application/json")) {
    return jsonError("Content-Type must be application/json", 415);
  }

  const user = await authenticatedUser(request, env);
  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const displayName = typeof input.displayName === "string"
    ? input.displayName.trim()
    : "";
  const avatarText = typeof input.avatarText === "string"
    ? input.avatarText.trim()
    : "";

  if (!displayName || displayName.length > 40) {
    return jsonError("Display name must be between 1 and 40 characters", 400);
  }
  if (!avatarText || graphemes(avatarText).length > 2) {
    return jsonError("Avatar text must be between 1 and 2 characters", 400);
  }

  await env.DB.prepare(
    `UPDATE AppUser
     SET DisplayName = ?, AvatarText = ?, Modifier = UserId, ModifiedDate = ?
     WHERE UserId = ? AND IsActive = 1`
  )
    .bind(displayName, avatarText, taipeiTimestamp(), user.UserId)
    .run();

  return Response.json({
    ok: true,
    user: {
      userId: user.UserId,
      email: user.Email,
      displayName,
      avatarText
    }
  });
}

async function authenticatedUser(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  const session = token && env.SESSION_SECRET
    ? await verifySession(token, env.SESSION_SECRET)
    : null;

  if (!session) {
    return null;
  }

  return env.DB.prepare(
    `SELECT UserId, Email, DisplayName, AvatarText FROM AppUser
     WHERE UserId = ? AND GoogleSubject = ? AND IsActive = 1 LIMIT 1`
  )
    .bind(session.userId, session.googleSubject)
    .first();
}

function userResponse(user) {
  return {
    userId: user.UserId,
    email: user.Email,
    displayName: user.DisplayName,
    avatarText: user.AvatarText || graphemes(user.DisplayName)[0] || "店"
  };
}

function logout(env) {
  return redirect(frontendUrl(env), [
    makeCookie(SESSION_COOKIE, "", 0, "/", "None")
  ]);
}

function authIsConfigured(env) {
  return Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.SESSION_SECRET
  );
}

function frontendUrl(env) {
  return env.FRONTEND_URL || "https://liangxuanchen.github.io/lash-record/";
}

function withCors(response, request, env) {
  const requestOrigin = request.headers.get("Origin");
  let allowedOrigin;

  try {
    allowedOrigin = new URL(frontendUrl(env)).origin;
  } catch {
    return response;
  }

  if (requestOrigin === allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.append("Vary", "Origin");
  }

  return response;
}

function isAllowedOrigin(request, env) {
  try {
    return request.headers.get("Origin") === new URL(frontendUrl(env)).origin;
  } catch {
    return false;
  }
}

function graphemes(value) {
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter("zh-Hant", { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), ({ segment }) => segment);
  }
  return Array.from(value);
}

function redirect(location, cookies) {
  const headers = new Headers({ Location: location.toString() });
  for (const value of cookies) {
    headers.append("Set-Cookie", value);
  }
  return new Response(null, { status: 302, headers });
}

function jsonError(message, status) {
  return Response.json({ ok: false, error: message }, { status });
}

function authError(message, status, setCookie) {
  const headers = new Headers({ "Content-Type": "text/html; charset=utf-8" });
  if (setCookie) {
    headers.append("Set-Cookie", setCookie);
  }
  return new Response(
    `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>登入失敗</title><body><h1>登入失敗</h1><p>${message}</p></body></html>`,
    { status, headers }
  );
}

function getCookie(request, name) {
  for (const item of (request.headers.get("Cookie") || "").split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0 || item.slice(0, separator).trim() !== name) {
      continue;
    }
    try {
      return decodeURIComponent(item.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

function makeCookie(name, value, maxAge, path, sameSite) {
  return [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "Secure",
    `SameSite=${sameSite}`
  ].join("; ");
}

async function createSession(user, secret) {
  const now = Math.floor(Date.now() / 1000);
  const payload = encodeBase64Url(JSON.stringify({
    ...user,
    issuedAt: now,
    expiresAt: now + SESSION_TTL
  }));
  return `${payload}.${await sign(payload, secret)}`;
}

async function verifySession(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const expected = await sign(parts[0], secret);
  if (!timingSafeEqual(parts[1], expected)) {
    return null;
  }

  try {
    const session = JSON.parse(decodeBase64Url(parts[0]));
    return session.userId &&
      session.googleSubject &&
      session.expiresAt > Math.floor(Date.now() / 1000)
      ? session
      : null;
  } catch {
    return null;
  }
}

async function sign(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function randomToken(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

function encodeBase64Url(value) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return new TextDecoder().decode(
    Uint8Array.from(binary, (character) => character.charCodeAt(0))
  );
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function taipeiTimestamp() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
}
