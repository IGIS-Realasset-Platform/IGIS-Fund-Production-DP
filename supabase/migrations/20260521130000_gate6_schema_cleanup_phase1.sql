do $$
declare
  worklog_count bigint := 0;
  read_snapshot_count bigint := 0;
begin
  if to_regclass('public.ll_worklogs') is not null then
    select count(*) into worklog_count from public.ll_worklogs;
    if worklog_count <> 0 then
      raise exception 'll_worklogs is not empty: % rows', worklog_count;
    end if;
  end if;

  if to_regclass('public.ll_dashboard_read_snapshots') is not null then
    select count(*) into read_snapshot_count from public.ll_dashboard_read_snapshots;
    if read_snapshot_count <> 0 then
      raise exception 'll_dashboard_read_snapshots is not empty: % rows', read_snapshot_count;
    end if;
  end if;
end $$;

drop table if exists public.ll_worklogs;
drop table if exists public.ll_dashboard_read_snapshots;
