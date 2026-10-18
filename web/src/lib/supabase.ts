import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const isConfigured = Boolean(url && publishableKey);
let browserClient: SupabaseClient | undefined;
export function browserSupabase(): SupabaseClient | null {
  if (!url || !publishableKey) return null;
  if (!browserClient) browserClient = createClient(url, publishableKey);
  return browserClient;
}
export function publicSupabase(): SupabaseClient | null {
  if (!url || !publishableKey) return null;
  // Cliente por solicitud, SIN cookies ni sesión administrativa en el servidor.
  return createClient(url, publishableKey, {auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false}});
}
export function publicPhotoUrl(path: string): string | null {
  if (!path) return null;
  // Fotografías provenientes de publicaciones originales verificadas de Agencia Flama.
  // Restricción estricta de dominio y nombre; nunca aceptar URLs arbitrarias.
  if (/^https:\/\/http2\.mlstatic\.com\/D_NQ_NP_[0-9]+-MLA[0-9]+_[0-9]{6}-[A-Z0-9]+\.webp$/.test(path)) {
    return path;
  }
  if (!url || /^(https?:)?\/\//i.test(path)) return null;
  const parts = path.split('/').map(encodeURIComponent).join('/');
  return `${url}/storage/v1/object/public/vehicle-images/${parts}`;
}
