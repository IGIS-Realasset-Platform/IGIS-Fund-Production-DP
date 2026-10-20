-- 사업별 법령 변경 확인 구독. 기존 회사 서비스·Auth·다른 스키마는 변경하지 않습니다.
begin;
do $guard$ begin
 if to_regclass('development_project_platform.law_watchlist') is null then raise exception 'Approved law watchlist is missing'; end if;
 if to_regclass('development_project_platform.platform_workspace') is null then raise exception 'Approved application workspace is missing'; end if;
end $guard$;
create table development_project_platform.law_project_watches(
 project_id text not null,watch_id text not null references development_project_platform.law_watchlist(id),sequence text not null check(sequence ~ '^[0-9]{1,30}$'),effective_at date,
 source_jurisdiction text,jurisdiction_status text not null check(jurisdiction_status in('unverified','national')),
 official_source jsonb not null check(jsonb_typeof(official_source)='object'),created_by text not null references development_project_platform.app_user(id),created_at timestamptz not null default now(),primary key(project_id,watch_id)
);
create index law_project_watches_watch_idx on development_project_platform.law_project_watches(watch_id,project_id);
alter table development_project_platform.law_project_watches enable row level security;
create policy runtime_only on development_project_platform.law_project_watches to development_project_platform_runtime using(true) with check(true);
revoke all on development_project_platform.law_project_watches from public,anon,authenticated,service_role,development_project_platform_runtime;
grant select,insert on development_project_platform.law_project_watches to development_project_platform_runtime;
grant insert on development_project_platform.law_watchlist to development_project_platform_runtime;
commit;
