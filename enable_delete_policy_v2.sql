-- Run this in Supabase SQL Editor to allow ALL users (including logged in) to delete logs
CREATE POLICY "Enable delete for all users on iota_seoul_logs" ON "public"."iota_seoul_logs"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users on iota_seoul_log_links" ON "public"."iota_seoul_log_links"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users on iota_seoul_log_stakeholders" ON "public"."iota_seoul_log_stakeholders"
AS PERMISSIVE FOR DELETE
TO public
USING (true);
