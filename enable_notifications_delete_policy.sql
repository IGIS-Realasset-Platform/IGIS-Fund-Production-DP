-- Enable delete policy for iota_notifications table
-- Run this in Supabase SQL Editor to allow client-side deletion of notifications.
DROP POLICY IF EXISTS "Enable delete for all users on iota_notifications" ON "public"."iota_notifications";
CREATE POLICY "Enable delete for all users on iota_notifications" ON "public"."iota_notifications"
AS PERMISSIVE FOR DELETE
TO public
USING (true);
