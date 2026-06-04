-- Enable insert policy for iota_notifications table
-- This allows client-side notification generation to insert rows for recipient users.
DROP POLICY IF EXISTS "Enable insert for all users on iota_notifications" ON "public"."iota_notifications";
CREATE POLICY "Enable insert for all users on iota_notifications" ON "public"."iota_notifications"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);
