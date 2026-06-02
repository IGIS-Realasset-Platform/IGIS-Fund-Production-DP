-- 1. Enable insert for authenticated and public users on iota_seoul_logs
-- This policy allows submitting feedback and feature requests to the platform.
DROP POLICY IF EXISTS "Enable insert for all users on iota_seoul_logs" ON "public"."iota_seoul_logs";
CREATE POLICY "Enable insert for all users on iota_seoul_logs" ON "public"."iota_seoul_logs"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- 2. Enable insert for authenticated and public users on iota_seoul_log_links
-- This policy allows linking submitted feedback logs to related projects (e.g., IOTA_COMMON).
DROP POLICY IF EXISTS "Enable insert for all users on iota_seoul_log_links" ON "public"."iota_seoul_log_links";
CREATE POLICY "Enable insert for all users on iota_seoul_log_links" ON "public"."iota_seoul_log_links"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);
