-- Gate 6 work platform save fix.
-- The deployed UI writes TASK and board records through ll-dashboard-api.
-- Edge authorization uses ll_user_permissions, so existing Auth users need
-- matching logistics permission rows before server-side writes can succeed.

with logistics_admin_auth_users as (
  select
    id as user_id,
    lower(email) as email
  from auth.users
  where lower(email) in (
    'kylee@igisam.com',
    'sjlee@igisam.com',
    'jk.jeon@igisam.com'
  )
),
asset_refs as (
  select array_agg(ref order by ref) as refs
  from (
    select asset_id as ref from public.ll_assets where asset_id is not null
    union
    select asset_code as ref from public.ll_assets where asset_code is not null
  ) source
)
insert into public.ll_user_permissions (
  user_id,
  email,
  logistics_role,
  organization,
  managed_asset_codes,
  managed_asset_permissions,
  other_asset_permissions,
  can_ingest_weekly,
  created_at,
  updated_at
)
select
  u.user_id,
  u.email,
  'System Admin',
  '기획추진센터',
  coalesce(a.refs, '{}'::text[]),
  '{"read": true, "create": true, "update": true, "delete": true}'::jsonb,
  '{"read": true, "create": true, "update": true, "delete": true}'::jsonb,
  true,
  now(),
  now()
from logistics_admin_auth_users u
cross join asset_refs a
on conflict (user_id) do update
set
  email = excluded.email,
  logistics_role = excluded.logistics_role,
  organization = excluded.organization,
  managed_asset_codes = excluded.managed_asset_codes,
  managed_asset_permissions = excluded.managed_asset_permissions,
  other_asset_permissions = excluded.other_asset_permissions,
  can_ingest_weekly = excluded.can_ingest_weekly,
  updated_at = now();

insert into public.ll_data_change_audit_logs (
  action,
  target_table,
  approval_status,
  metadata,
  created_at
)
values (
  'permission_seed',
  'public.ll_user_permissions',
  'server_authorized_write',
  jsonb_build_object(
    'source_table', 'auth.users',
    'reason', 'Enable server-side work platform TASK and board writes for registered logistics admin users',
    'emails', jsonb_build_array('kylee@igisam.com', 'sjlee@igisam.com', 'jk.jeon@igisam.com')
  ),
  now()
);
