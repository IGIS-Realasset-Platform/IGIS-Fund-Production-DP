-- 검토용 스키마 계약. 원격 적용은 이름을 기록하는 Supabase migration 도구로 수행합니다.
-- 기존 서비스 객체·Auth·Data API 설정은 변경하지 않습니다.
do $guard$
begin
 if to_regnamespace('development_project_platform') is null then raise exception 'Approved private schema is missing'; end if;
 if exists(select 1 from pg_roles where rolname='development_project_platform_runtime') then raise exception 'Runtime role already exists; inspect before modifying'; end if;
end $guard$;

create role development_project_platform_runtime nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls connection limit 6;
grant usage on schema development_project_platform to development_project_platform_runtime;

create table development_project_platform.app_user(
 id text primary key,
 name text not null,
 email text not null check(email=lower(email) and email ~ '^[^@[:space:]]+@igisam\.com$'),
 "emailVerified" boolean not null,
 image text,
 "createdAt" timestamptz not null default current_timestamp,
 "updatedAt" timestamptz not null default current_timestamp
);
create unique index app_user_email_uidx on development_project_platform.app_user(email);
create table development_project_platform.app_session(
 id text primary key,
 "expiresAt" timestamptz not null,
 token text not null,
 "createdAt" timestamptz not null default current_timestamp,
 "updatedAt" timestamptz not null,
 "ipAddress" text,
 "userAgent" text,
 "userId" text not null references development_project_platform.app_user(id) on delete cascade
);
create unique index app_session_token_uidx on development_project_platform.app_session(token);
create index "app_session_userId_idx" on development_project_platform.app_session("userId");
create index app_session_expiry_idx on development_project_platform.app_session("expiresAt");
create table development_project_platform.app_account(
 id text primary key,
 "accountId" text not null,
 "providerId" text not null,
 "userId" text not null references development_project_platform.app_user(id) on delete cascade,
 "accessToken" text,
 "refreshToken" text,
 "idToken" text,
 "accessTokenExpiresAt" timestamptz,
 "refreshTokenExpiresAt" timestamptz,
 scope text,
 password text,
 "createdAt" timestamptz not null default current_timestamp,
 "updatedAt" timestamptz not null
);
create index "app_account_userId_idx" on development_project_platform.app_account("userId");
create table development_project_platform.app_verification(
 id text primary key,
 identifier text not null,
 value text not null,
 "expiresAt" timestamptz not null,
 "createdAt" timestamptz not null default current_timestamp,
 "updatedAt" timestamptz not null default current_timestamp
);
create index app_verification_identifier_idx on development_project_platform.app_verification(identifier);
create index app_verification_expiry_idx on development_project_platform.app_verification("expiresAt");
create table development_project_platform.app_rate_limit(
 id text primary key,
 key text not null,
 count integer not null,
 -- Date.now() 밀리초를 보존하므로 PostgreSQL int4가 아닌 bigint를 사용합니다.
 "lastRequest" bigint not null
);
create unique index app_rate_limit_key_uidx on development_project_platform.app_rate_limit(key);

create table development_project_platform.platform_workspace(
 workspace_id text primary key,
 state jsonb not null check(jsonb_typeof(state)='object' and jsonb_typeof(state->'projects')='array'),
 revision bigint not null check(revision>=0 and revision<=9007199254740991),
 updated_at timestamptz not null default current_timestamp
);
create table development_project_platform.platform_admins(
 user_id text primary key references development_project_platform.app_user(id) on delete cascade,
 created_at timestamptz not null default current_timestamp
);
create table development_project_platform.project_members(
 project_id text not null,
 user_id text not null references development_project_platform.app_user(id) on delete cascade,
 role text not null check(role in ('viewer','editor','approver')),
 updated_at timestamptz not null default current_timestamp,
 primary key(project_id,user_id)
);
create index project_members_user_idx on development_project_platform.project_members(user_id);
create table development_project_platform.workspace_requests(
 workspace_id text not null references development_project_platform.platform_workspace(workspace_id),
 user_id text not null references development_project_platform.app_user(id),
 request_id text not null,
 body_hash text not null,
 result_revision bigint not null,
 response jsonb not null,
 created_at timestamptz not null default current_timestamp,
 primary key(workspace_id,user_id,request_id)
);
create table development_project_platform.workspace_audit(
 id uuid primary key,
 workspace_id text not null references development_project_platform.platform_workspace(workspace_id),
 user_id text not null references development_project_platform.app_user(id),
 request_id text not null,
 base_revision bigint not null,
 next_revision bigint not null,
 changed_project_ids jsonb not null,
 state_before_hash text not null,
 state_after_hash text not null,
 state_before jsonb not null,
 created_at timestamptz not null default current_timestamp,
 unique(workspace_id,user_id,request_id)
);
create index workspace_audit_revision_idx on development_project_platform.workspace_audit(workspace_id,next_revision);

insert into development_project_platform.platform_workspace(workspace_id,state,revision)
values('platform','{"version":"0.11.0","storageRevision":0,"currentProjectId":"","selectedProjectId":"","projects":[],"entities":[],"auditEvents":[],"notifications":[],"companies":[],"lawCatalog":[],"lawChanges":[],"lawUpdateRuns":[],"projectLawImpacts":[],"migrationConflicts":[],"integrityIssues":[],"storageQuarantine":[],"sourceLoad":{"status":"unavailable","schemaVersion":"notion-development-projects-v1","expectedCount":null,"actualCount":0,"hasMore":null,"syncedAt":""}}'::jsonb,0);

-- 일반 사용자/API 역할에는 새 영역 권한을 추가하지 않습니다.
-- 서버 전용 최소역할만 접근하며 최종 사용자/사업 권한은 인증된 서버가 검사합니다.
do $policies$
declare table_name text;
begin
 foreach table_name in array array['app_user','app_session','app_account','app_verification','app_rate_limit','platform_workspace','platform_admins','project_members','workspace_requests','workspace_audit'] loop
  execute format('alter table development_project_platform.%I enable row level security',table_name);
  execute format('create policy runtime_only on development_project_platform.%I to development_project_platform_runtime using (true) with check (true)',table_name);
 end loop;
end $policies$;
revoke all on all tables in schema development_project_platform from public,anon,authenticated,service_role;
grant select,insert,update,delete on development_project_platform.app_user,development_project_platform.app_session,development_project_platform.app_account,development_project_platform.app_verification,development_project_platform.app_rate_limit to development_project_platform_runtime;
grant select,insert,update on development_project_platform.platform_workspace,development_project_platform.project_members to development_project_platform_runtime;
grant delete on development_project_platform.project_members to development_project_platform_runtime;
grant select,insert on development_project_platform.platform_admins,development_project_platform.workspace_requests,development_project_platform.workspace_audit to development_project_platform_runtime;
