-- Bootstrap seguro del primer administrador de Flama Autos.
-- La dirección autorizada se almacena exclusivamente en la base,
-- nunca en el repositorio público.
BEGIN;
CREATE TABLE IF NOT EXISTS private.initial_admin_invites (
  email_normalized text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT admin_invite_email_normalized
    CHECK (email_normalized = lower(btrim(email_normalized)))
);
REVOKE ALL ON TABLE private.initial_admin_invites FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.claim_initial_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.email IS NULL OR NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE private.initial_admin_invites
     SET claimed_at = now(), claimed_by = NEW.id
   WHERE email_normalized = lower(btrim(NEW.email))
     AND claimed_at IS NULL;

  IF FOUND THEN
    INSERT INTO public.staff (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION private.claim_initial_admin() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS flama_claim_initial_admin ON auth.users;
CREATE TRIGGER flama_claim_initial_admin
AFTER INSERT OR UPDATE OF email, email_confirmed_at
ON auth.users
FOR EACH ROW
EXECUTE FUNCTION private.claim_initial_admin();
COMMIT;
