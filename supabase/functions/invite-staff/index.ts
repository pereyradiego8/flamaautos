import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const allowedOrigin = "https://flamaautos.vercel.app";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    if (origin && origin !== allowedOrigin) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const origin = request.headers.get("origin");
  if (origin && origin !== allowedOrigin) return json({ error: "Origen no autorizado" }, 403);

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token || token.length > 5000) return json({ error: "Sesión requerida" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secrets = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}") as Record<string, string>;
  const serviceKey = secrets.default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Servicio no configurado" }, 503);

  const client = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  try {
    // Comprobar identidad contra Supabase Auth; nunca confiar en un user_id enviado por cliente.
    const { data: identity, error: identityError } = await client.auth.getUser(token);
    if (identityError || !identity.user?.id) return json({ error: "Sesión inválida" }, 401);
    if (!identity.user.email_confirmed_at) return json({ error: "Correo sin confirmar" }, 403);

    const { data: caller, error: callerError } = await client.from("staff")
      .select("role").eq("user_id", identity.user.id).maybeSingle();
    if (callerError) return json({ error: "No se pudieron comprobar permisos" }, 503);
    if (caller?.role !== "admin") return json({ error: "Solo un administrador puede invitar personal" }, 403);

    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object") return json({ error: "Datos inválidos" }, 400);
    const input = payload as Record<string, unknown>;
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const role = input.role === "admin" ? "admin" : input.role === "editor" ? "editor" : null;
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !role) {
      return json({ error: "Indicá correo y rol válidos" }, 400);
    }
    // Los correos y contraseñas no se guardan en el código ni se registran en logs.
    const { data: invited, error: inviteError } = await client.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${allowedOrigin}/admin`,
    });
    if (inviteError || !invited?.user?.id) {
      return json({ error: "No se pudo enviar la invitación. Verificá si el usuario ya existe o si se alcanzó el límite de correos." }, 409);
    }
    const { error: staffError } = await client.from("staff")
      .insert({ user_id: invited.user.id, role });
    if (staffError) {
      return json({ error: "Se envió la invitación, pero falló la asignación de permisos. Revisá el usuario en Supabase antes de reenviar." }, 503);
    }
    return json({ ok: true, message: "Invitación enviada. La persona deberá aceptar el correo y establecer su contraseña." });
  } catch {
    return json({ error: "No se pudo procesar la solicitud" }, 400);
  }
});
