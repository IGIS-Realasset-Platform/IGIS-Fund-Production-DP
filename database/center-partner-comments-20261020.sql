-- CENTER120-17: 새 공용 댓글만 추가 저장합니다. 원사이트·기존 업무자료는 변경하지 않습니다.
begin;
do $guard$ begin
 if to_regclass('development_project_platform.app_user') is null or to_regclass('development_project_platform.reference_snapshots') is null then raise exception 'Approved application tables are missing'; end if;
 if not exists(select 1 from pg_roles where rolname='development_project_platform_runtime') then raise exception 'Approved application runtime role is missing'; end if;
end $guard$;
create table development_project_platform.partner_comments(
 id uuid primary key,
 company_key text not null check(char_length(company_key) between 1 and 500),
 source_comment_key text check(source_comment_key is null or char_length(source_comment_key) between 1 and 500),
 reference_version text not null check(char_length(reference_version)>0),
 created_by text not null references development_project_platform.app_user(id),
 author_email text not null check(author_email=lower(author_email) and author_email ~ '^[^[:space:]@]+@igisam[.]com$'),
 request_id text not null check(request_id ~ '^[a-zA-Z0-9_-]{16,100}$'),
 body_hash text not null check(body_hash ~ '^[a-f0-9]{64}$'),
 text text not null check(char_length(text) between 1 and 5000 and char_length(btrim(text))>0),
 cooperative boolean not null,
 project_text text not null default '' check(char_length(project_text)<=300),
 created_at timestamptz not null default now(),
 unique(created_by,request_id)
);
create index partner_comments_shared_page_idx on development_project_platform.partner_comments(source_comment_key,created_at desc,id desc) where source_comment_key is not null;
create index partner_comments_company_page_idx on development_project_platform.partner_comments(company_key,created_at desc,id desc) where source_comment_key is null;
alter table development_project_platform.partner_comments enable row level security;
create policy runtime_select on development_project_platform.partner_comments for select to development_project_platform_runtime using(true);
create policy runtime_insert on development_project_platform.partner_comments for insert to development_project_platform_runtime with check(true);
revoke all on development_project_platform.partner_comments from public,anon,authenticated,service_role,development_project_platform_runtime;
grant select,insert on development_project_platform.partner_comments to development_project_platform_runtime;
-- 예상하지 못한 기존 default privileges가 새 테이블에 붙으면 적용을 확정하지 않습니다.
-- 다른 테이블·스키마의 권한을 고치거나 넓히지 않고 이 transaction을 실패시킵니다.
do $acl_guard$ declare runtime_oid oid;begin
 select oid into runtime_oid from pg_roles where rolname='development_project_platform_runtime';
 if exists(select 1 from pg_class c cross join lateral aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a where c.oid='development_project_platform.partner_comments'::regclass and a.grantee<>c.relowner and not(a.grantee=runtime_oid and a.privilege_type in('SELECT','INSERT'))) then raise exception 'Unexpected privilege on the new comment table'; end if;
end $acl_guard$;
commit;
