-- 실제 앱 전용 DB의 스키마/권한 경계 검사. 시험행은 최종 ROLLBACK.
begin;
set local role development_project_platform_runtime;
set local search_path=pg_catalog,development_project_platform;
do $test$ declare actor text;made uuid='cc120000-0000-4000-8000-000000000001';begin
 select id into strict actor from development_project_platform.app_user where email='kylee@igisam.com' and "emailVerified"=true;
 if has_table_privilege(current_user,'development_project_platform.cost_snapshots','UPDATE') or has_table_privilege(current_user,'development_project_platform.cost_snapshots','DELETE') then raise exception 'Snapshot history must not be mutable by runtime'; end if;
 if has_table_privilege('anon','development_project_platform.reference_snapshots','SELECT') or has_table_privilege('authenticated','development_project_platform.notification_states','SELECT') then raise exception 'App tables must not be exposed to shared Auth/Data API roles'; end if;
 insert into development_project_platform.notification_states(user_id,notification_id,read_at) values(actor,'center120-rollback-only',now());
 if not exists(select 1 from development_project_platform.notification_states where user_id=actor and notification_id='center120-rollback-only') then raise exception 'Allowed personal state insert did not happen'; end if;
 insert into development_project_platform.cost_snapshots(id,project_id,kind,label,as_of_date,version,reason,workspace_revision,created_by,request_id,body_hash,payload)
 values(made,'CENTER120-ROLLBACK-ONLY','event','격리 DB 제약 검사',current_date,1,'rollback only',0,actor,'center120-rollback-only','synthetic','{}'::jsonb);
 if not exists(select 1 from development_project_platform.cost_snapshots where id=made) then raise exception 'Allowed snapshot insert did not happen'; end if;
 begin
  insert into development_project_platform.cost_snapshots(id,project_id,kind,label,as_of_date,version,reason,workspace_revision,created_by,request_id,body_hash,payload)
  values('cc120000-0000-4000-8000-000000000002','CENTER120-ROLLBACK-ONLY','quarterly','분기 누락 차단',current_date,2,'rollback only',0,actor,'center120-rollback-only-2','synthetic','{}'::jsonb);
  raise exception 'Missing quarterly key was allowed';
 exception when check_violation then null;end;
 begin
  insert into development_project_platform.cost_snapshots(id,project_id,kind,label,as_of_date,version,reason,workspace_revision,created_by,request_id,body_hash,payload)
  values('cc120000-0000-4000-8000-000000000003','CENTER120-ROLLBACK-ONLY','event','재요청 중복 차단',current_date,3,'rollback only',0,actor,'center120-rollback-only','synthetic','{}'::jsonb);
  raise exception 'Duplicate request ID was allowed';
 exception when unique_violation then null;end;
 begin update development_project_platform.cost_snapshots set label='forbidden' where id=made;raise exception 'Snapshot update was allowed';exception when insufficient_privilege then null;end;
 begin delete from development_project_platform.cost_snapshots where id=made;raise exception 'Snapshot delete was allowed';exception when insufficient_privilege then null;end;
 if not exists(select 1 from development_project_platform.cost_snapshots where id=made and label='격리 DB 제약 검사') then raise exception 'Denied writes changed prior snapshot';end if;
end $test$;
rollback;
