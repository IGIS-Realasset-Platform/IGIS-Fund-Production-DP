select jsonb_build_object(
  'table_counts', jsonb_build_object(
    'll_lease_space_area_breakdowns', (select count(*) from public.ll_lease_space_area_breakdowns),
    'll_lease_space_specs', (select count(*) from public.ll_lease_space_specs),
    'll_lease_special_terms', (select count(*) from public.ll_lease_special_terms),
    'll_source_review_logs', (select count(*) from public.ll_source_review_logs)
  ),
  'source_cell_counts', jsonb_build_object(
    'll_lease_space_area_breakdowns', (select count(*) from public.ll_lease_space_area_breakdowns where source_cell_id is not null),
    'll_lease_space_specs', (select count(*) from public.ll_lease_space_specs where source_cell_id is not null),
    'll_lease_special_terms', (select count(*) from public.ll_lease_special_terms where source_cell_id is not null),
    'll_source_review_logs', (select count(*) from public.ll_source_review_logs where source_row_id is not null)
  ),
  'basis_counts', jsonb_build_object(
    'area_db_general', (select count(*) from public.ll_lease_space_area_breakdowns where basis = 'DB_일반'),
    'spec_db_general', (select count(*) from public.ll_lease_space_specs where basis = 'DB_일반'),
    'term_db_general', (select count(*) from public.ll_lease_special_terms where basis = 'DB_일반')
  ),
  'core_counts', jsonb_build_object(
    'll_source_cells', (select count(*) from public.ll_source_cells),
    'll_assets', (select count(*) from public.ll_assets),
    'll_tenants', (select count(*) from public.ll_tenants),
    'll_leases', (select count(*) from public.ll_leases),
    'll_lease_spaces', (select count(*) from public.ll_lease_spaces),
    'll_rent_history', (select count(*) from public.ll_rent_history),
    'll_weekly_assets', (select count(*) from public.ll_weekly_assets)
  )
) as readback;
