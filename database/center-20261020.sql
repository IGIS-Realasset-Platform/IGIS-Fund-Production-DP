-- CENTER120: 이 앱의 기존 전용 스키마만 호환 확장합니다. 최초 적용 전후 객체/권한은 별도 검증합니다.
begin;
do $guard$ declare claimed integer;distinct_ids integer;approved integer;begin
 if to_regclass('development_project_platform.platform_workspace') is null then raise exception 'Approved application schema is missing'; end if;
 if not exists(select 1 from pg_roles where rolname='development_project_platform_runtime') then raise exception 'Approved application role is missing'; end if;
 perform 1 from development_project_platform.platform_workspace where workspace_id='platform' for share;
 select count(*),count(distinct p->>'id'),count(*) filter(where p->'testData'=jsonb_build_object('kind','user-approved-html-fixture','batchId','20261016-abc','sourceProjectId',case p->>'id' when 'TEST-20261016-A' then 'YD427' when 'TEST-20261016-B' then 'YD816' when 'TEST-20261016-C' then 'IOTA' end,'sourceHtmlSha256','0271502c802e8f98ffc927b5c06c9da45b39ea7d76de74a03b7accea17cace7a')) into claimed,distinct_ids,approved
 from development_project_platform.platform_workspace w cross join lateral jsonb_array_elements(w.state->'projects') p
 where w.workspace_id='platform' and p->>'id'=any(array['TEST-20261016-A','TEST-20261016-B','TEST-20261016-C']);
 if claimed<>3 or distinct_ids<>3 or approved<>3 then raise exception 'Exactly three unique approved sample fixtures are required'; end if;
end $guard$;
create table development_project_platform.notification_states(
 user_id text not null references development_project_platform.app_user(id) on delete cascade,
 notification_id text not null,read_at timestamptz,deleted_at timestamptz,updated_at timestamptz not null default now(),primary key(user_id,notification_id)
);
create table development_project_platform.reference_snapshots(
 kind text not null check(kind in('partners','laws')),version text not null,checked_at timestamptz not null,source jsonb not null,payload jsonb not null check(jsonb_typeof(payload)='object'),created_at timestamptz not null default now(),primary key(kind,version)
);
create index reference_snapshots_latest_idx on development_project_platform.reference_snapshots(kind,checked_at desc);
create table development_project_platform.maintenance_configuration(key text primary key,value jsonb not null,created_at timestamptz not null default now());
insert into development_project_platform.maintenance_configuration(key,value) values('center_rollout',jsonb_build_object('introducedAt',now())) on conflict(key) do nothing;
create table development_project_platform.maintenance_status(
 job text primary key,status text not null,last_success_at timestamptz,last_attempt_at timestamptz,cursor text,lease_until timestamptz,active_run_id uuid,error_code text,details jsonb not null default '{}'::jsonb
);
create table development_project_platform.maintenance_runs(
 id uuid primary key,job text not null,day_key date not null,status text not null,started_at timestamptz not null default now(),finished_at timestamptz,error_code text,details jsonb not null default '{}'::jsonb
);
create index maintenance_runs_job_day_idx on development_project_platform.maintenance_runs(job,day_key,started_at desc);
create table development_project_platform.quarterly_tasks(
 id text primary key,project_id text not null,quarter_key text not null check(quarter_key ~ '^[0-9]{4}-Q[1-4]$'),due_date date not null,created_at timestamptz not null default now(),completed_at timestamptz,completed_by text references development_project_platform.app_user(id),snapshot_id uuid,unique(project_id,quarter_key)
);
create index quarterly_tasks_pending_idx on development_project_platform.quarterly_tasks(project_id,due_date desc) where completed_at is null;
create table development_project_platform.cost_snapshots(
 id uuid primary key,project_id text not null,kind text not null check(kind in('quarterly','event','approvedBudget')),label text not null,as_of_date date not null,captured_at timestamptz not null default now(),quarter_key text,version integer not null check(version>0),reason text not null,corrects_id uuid references development_project_platform.cost_snapshots(id),workspace_revision bigint not null,created_by text not null references development_project_platform.app_user(id),request_id text not null,body_hash text not null,payload jsonb not null check(jsonb_typeof(payload)='object'),unique(created_by,request_id),unique(project_id,version),check((kind='quarterly' and quarter_key is not null) or (kind<>'quarterly' and quarter_key is null))
);
create index cost_snapshots_project_capture_idx on development_project_platform.cost_snapshots(project_id,captured_at desc);
alter table development_project_platform.quarterly_tasks add constraint quarterly_tasks_snapshot_fk foreign key(snapshot_id) references development_project_platform.cost_snapshots(id);
create table development_project_platform.law_watchlist(
 id text primary key,target text not null check(target in('law','admrul','ordin')),name text not null,jurisdiction text,source jsonb not null,active boolean not null default true,unique(target,name)
);
-- 매 로그인 재부여를 막기 위해 인증된 기존 회원 보완은 이 migration에서 한 번만 실행합니다.
insert into development_project_platform.project_members(project_id,user_id,role,updated_at)
select p->>'id',u.id,'editor',now()
from development_project_platform.platform_workspace w
cross join lateral jsonb_array_elements(w.state->'projects') p
cross join development_project_platform.app_user u
where w.workspace_id='platform' and u."emailVerified"=true
and u.email=any(array['kylee@igisam.com','jghong@igisam.com','hj.kim@igisam.com','shjeon@igisam.com','dikim@igisam.com','kbs1208@igisam.com','jang.sj@igisam.com','patioblue@igisam.com','minho@igisam.com','jaemin.hwang@igisam.com','sjlee@igisam.com','jk.jeon@igisam.com'])
and p->>'id'=any(array['TEST-20261016-A','TEST-20261016-B','TEST-20261016-C'])
and p->'testData'=jsonb_build_object('kind','user-approved-html-fixture','batchId','20261016-abc','sourceProjectId',case p->>'id' when 'TEST-20261016-A' then 'YD427' when 'TEST-20261016-B' then 'YD816' when 'TEST-20261016-C' then 'IOTA' end,'sourceHtmlSha256','0271502c802e8f98ffc927b5c06c9da45b39ea7d76de74a03b7accea17cace7a')
on conflict(project_id,user_id) do update set role='editor',updated_at=now() where development_project_platform.project_members.role='viewer';
do $policies$ declare t text; begin
 foreach t in array array['notification_states','reference_snapshots','maintenance_configuration','maintenance_status','maintenance_runs','quarterly_tasks','cost_snapshots','law_watchlist'] loop
  execute format('alter table development_project_platform.%I enable row level security',t);
  execute format('create policy runtime_only on development_project_platform.%I to development_project_platform_runtime using (true) with check (true)',t);
  execute format('revoke all on development_project_platform.%I from public,anon,authenticated,service_role,development_project_platform_runtime',t);
 end loop;
end $policies$;
grant select,insert,update on development_project_platform.notification_states,development_project_platform.maintenance_status,development_project_platform.maintenance_runs,development_project_platform.quarterly_tasks to development_project_platform_runtime;
grant select,insert on development_project_platform.reference_snapshots,development_project_platform.cost_snapshots to development_project_platform_runtime;
grant select on development_project_platform.maintenance_configuration,development_project_platform.law_watchlist to development_project_platform_runtime;
commit;
