-- Application-only, read-only projection. Does not ALTER/GRANT orgdb or its source.
-- Run as the existing postgres deployment owner. Not applied by this file's author.
begin;
set local lock_timeout = '2s';
set local statement_timeout = '10s';
create view development_project_platform.employee_directory
 with (security_barrier=true, security_invoker=false)
 as select employee_number as employee_id,full_name as name,email
 from orgdb.employee_profiles;
revoke all on development_project_platform.employee_directory from public,anon,authenticated,service_role;
grant select on development_project_platform.employee_directory to development_project_platform_runtime;
comment on view development_project_platform.employee_directory is 'Read-only employee number, name and email projection for authenticated project manager selection. Source orgdb is unchanged; organization, evaluations and other personal fields are not exposed.';
commit;
