-- Gate 6: remove obsolete personal/team/sector scope from logistics task manager.
-- Mutation scope: public.ll_* only.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'll_work_platform_tasks'
      and column_name = 'scope'
  ) then
    update public.ll_work_platform_tasks
    set
      payload = coalesce(payload, '{}'::jsonb)
        || jsonb_build_object(
          'removed_scope', scope,
          'scope_removed_status', 'deleted_by_user_request_current_stage',
          'scope_removed_reason', 'personal/team/sector task segmentation removed from current logistics work platform UI',
          'scope_removed_at', now()
        ),
      updated_at = now()
    where scope is not null;

    drop policy if exists "ll_work_platform_tasks_read_scoped" on public.ll_work_platform_tasks;
    drop index if exists public.ll_work_platform_tasks_scope_idx;

    alter table public.ll_work_platform_tasks
      drop column if exists scope;
  end if;
end $$;

drop policy if exists "ll_work_platform_tasks_read_scoped" on public.ll_work_platform_tasks;
drop policy if exists "ll_work_platform_tasks_read_permitted_assets" on public.ll_work_platform_tasks;
create policy "ll_work_platform_tasks_read_permitted_assets"
on public.ll_work_platform_tasks
for select
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.ll_user_permissions p
    where p.user_id = auth.uid()
      and (
        p.logistics_role in ('Manager', 'Admin', 'System Admin')
        or coalesce(ll_work_platform_tasks.related_asset_id, '') = any(p.managed_asset_codes)
        or exists (
          select 1
          from public.ll_assets a
          where a.asset_id = ll_work_platform_tasks.related_asset_id
            and (
              a.asset_id = any(p.managed_asset_codes)
              or a.asset_code = any(p.managed_asset_codes)
            )
        )
        or coalesce((p.other_asset_permissions ->> 'read')::boolean, false)
        or (
          coalesce(ll_work_platform_tasks.related_asset_id, '') = ''
          and coalesce(ll_work_platform_tasks.organization, '') = coalesce(p.organization, '')
        )
      )
  )
);

insert into public.ll_api_audit_logs (action, status_code, requested_by, request_payload)
values (
  'schema/ll_work_platform_tasks/drop_scope',
  200,
  null,
  jsonb_build_object(
    'table', 'public.ll_work_platform_tasks',
    'removed_column', 'scope',
    'old_values_preserved_in_payload_key', 'removed_scope',
    'status', 'deleted_by_user_request_current_stage',
    'applied_at', now()
  )
);

comment on table public.ll_work_platform_tasks is
  '물류센터 워크 플랫폼 주요 TASK 관리 전용 테이블. personal/team/sector scope column removed by user request; old values preserved in payload.removed_scope. Writes are server-side only.';
