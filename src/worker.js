export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      const result = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM AppUser"
      ).first();

      return Response.json({
        ok: true,
        database: "connected",
        appUserCount: result?.count ?? 0
      });
    }

    return new Response("Lash Record API");
  }
};
