-- REVIEW130: report bodies live outside the 4MB workspace JSON.
-- Apply by the approved database owner only. Existing workspace/history is not migrated.
begin;
do $guard$ begin
 if to_regclass('development_project_platform.platform_workspace') is null or to_regclass('development_project_platform.app_user') is null or to_regclass('development_project_platform.project_members') is null then raise exception 'Approved application tables are missing'; end if;
 if not exists(select 1 from pg_roles where rolname='development_project_platform_runtime') then raise exception 'Approved runtime role is missing'; end if;
 if to_regclass('development_project_platform.report_snapshots') is not null or to_regclass('development_project_platform.report_snapshot_events') is not null then raise exception 'Report archive tables already exist; verify their exact schema instead of replacing them'; end if;
end $guard$;
create table development_project_platform.report_snapshots(
 id uuid primary key,
 project_id text not null check(char_length(project_id) between 1 and 200 and project_id=btrim(project_id)),
 source_id text not null check(char_length(source_id) between 1 and 200 and source_id=btrim(source_id)),
 type text not null check(type in('plan','progress','cancel','complete')),
 record_date date not null,
 stage_id text not null check(char_length(stage_id) between 1 and 200),
 template_version text not null default '' check(char_length(template_version)<=200),
 layout_version text not null default '' check(char_length(layout_version)<=200),
 status text not null default '작성본' check(status in('작성본','검토 중','확정','제출','정정')),
 submitted text not null default '',
 receipt text not null default '' check(char_length(receipt)<=20000),
 status_version bigint not null default 1 check(status_version between 1 and 9007199254740991),
 created_by text not null references development_project_platform.app_user(id),
 created_at timestamptz not null default now(),
 updated_by text not null references development_project_platform.app_user(id),
 updated_at timestamptz not null default now(),
 record_hash text not null check(record_hash ~ '^[a-f0-9]{64}$'),
 record_bytes integer not null check(record_bytes between 2 and 4000000),
 record jsonb not null check(jsonb_typeof(record)='object'),
 unique(project_id,source_id),
 check(case when submitted='' then true when submitted ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then to_char(submitted::date,'YYYY-MM-DD')=submitted else false end),
 check(status<>'제출' or submitted<>''),
 check((record->>'id'=source_id and record->>'type'=type and record->>'date'=to_char(record_date,'YYYY-MM-DD') and record->>'stageId'=stage_id and record->>'status'='작성본' and record->>'submitted'='' and record->>'receipt'='' and record->'canonical'->>'id'=project_id and record->'payload'->>'id'=project_id) is true)
);
create index report_snapshots_project_created_idx on development_project_platform.report_snapshots(project_id,created_at desc,id desc);
create table development_project_platform.report_snapshot_events(
 id uuid primary key,
 snapshot_id uuid not null references development_project_platform.report_snapshots(id),
 project_id text not null check(char_length(project_id) between 1 and 200),
 created_by text not null references development_project_platform.app_user(id),
 request_id text not null check(request_id ~ '^[a-zA-Z0-9_-]{16,100}$'),
 operation text not null check(operation in('create','status')),
 body_hash text not null check(body_hash ~ '^[a-f0-9]{64}$'),
 before_metadata jsonb,
 after_metadata jsonb not null check(jsonb_typeof(after_metadata)='object'),
 created_at timestamptz not null default now(),
 unique(created_by,request_id),
 check(before_metadata is null or jsonb_typeof(before_metadata)='object')
);
create index report_snapshot_events_snapshot_idx on development_project_platform.report_snapshot_events(snapshot_id,created_at,id);
alter table development_project_platform.report_snapshots enable row level security;
alter table development_project_platform.report_snapshot_events enable row level security;
create policy runtime_select on development_project_platform.report_snapshots for select to development_project_platform_runtime using(true);
create policy runtime_insert on development_project_platform.report_snapshots for insert to development_project_platform_runtime with check(true);
create policy runtime_status_update on development_project_platform.report_snapshots for update to development_project_platform_runtime using(true) with check(true);
create policy runtime_select on development_project_platform.report_snapshot_events for select to development_project_platform_runtime using(true);
create policy runtime_insert on development_project_platform.report_snapshot_events for insert to development_project_platform_runtime with check(true);
revoke all on development_project_platform.report_snapshots,development_project_platform.report_snapshot_events from public,anon,authenticated,service_role,development_project_platform_runtime;
grant select,insert on development_project_platform.report_snapshots,development_project_platform.report_snapshot_events to development_project_platform_runtime;
-- Runtime cannot UPDATE record, identity, type, date, template or creator, or DELETE rows.
grant update(status,submitted,receipt,status_version,updated_by,updated_at) on development_project_platform.report_snapshots to development_project_platform_runtime;
do $acl_guard$ declare runtime_oid oid;begin
 select oid into runtime_oid from pg_roles where rolname='development_project_platform_runtime';
 if exists(select 1 from pg_class c cross join lateral aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a where c.oid in('development_project_platform.report_snapshots'::regclass,'development_project_platform.report_snapshot_events'::regclass) and a.grantee<>c.relowner and not(a.grantee=runtime_oid and a.privilege_type in('SELECT','INSERT'))) then raise exception 'Unexpected table privilege on the new report archives'; end if;
 if exists(select 1 from pg_attribute col cross join lateral aclexplode(col.attacl) a where col.attrelid='development_project_platform.report_snapshots'::regclass and not(a.grantee=runtime_oid and a.privilege_type='UPDATE' and col.attname in('status','submitted','receipt','status_version','updated_by','updated_at'))) then raise exception 'Unexpected column privilege on report archives'; end if;
end $acl_guard$;
commit;
