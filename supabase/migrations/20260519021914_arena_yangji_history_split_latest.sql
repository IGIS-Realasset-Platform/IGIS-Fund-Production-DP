-- Gate 6: A112127001 latest lease-space split from source Excel DB history.
-- Mutation scope: public.ll_* only. Source workbook: ★ 260414_물류센터 임대차계약 DB_취합본.xlsx

with latest(asset_id, tenant_id, lease_id, lease_space_id, floor_label, detail_area_label, temperature_type, leased_area_sqm, exclusive_area_sqm, monthly_rent_total, monthly_mf_total, rent_per_py, mf_per_py, e_noc, effective_date, source_sheet_row_id, source_excel_visible_row, goods_type, is_preleased, is_3pl, is_single_tenant, office_use_yn, sublease_yn, delinquency_yn, general_source_row_id) as (
  values
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|1|na|n', '1', null, 'N', 39906.79, 30737.07, 320174316, 12806973, 26522, 1061, 27583.39, '2024-03-01', 'sheet_db_history:r000041', 41, '하중물', true, true, false, 'Y', 'Y', 'N', 'sheet_db_general:r000011'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|2|na|office', '2', null, '사무실', 2434.11, 1986.33, 19529047, 781162, 26523, 1061, 27583.46, '2024-03-01', 'sheet_db_history:r000038', 38, '하중물', true, true, false, 'Y', 'Y', 'N', 'sheet_db_general:r000011'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|3|na|n', '3', null, 'N', 40294.91, 32950.57, 323288322, 12931533, 26522, 1061, 27583.4, '2024-03-01', 'sheet_db_history:r000035', 35, '하중물', true, true, false, 'Y', 'Y', 'N', 'sheet_db_general:r000011'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|4|na|office', '4', null, '사무실', 1848.98, 1443.61, 14834565, 593383, 26523, 1061, 27583.58, '2024-03-01', 'sheet_db_history:r000032', 32, '하중물', true, true, false, 'Y', 'Y', 'N', 'sheet_db_general:r000011'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|5|na|n', '5', null, 'N', 42526.66, 35123.38, 341193662, 13647746, 26522, 1061, 27583.39, '2024-03-01', 'sheet_db_history:r000029', 29, '하중물', true, true, false, 'Y', 'Y', 'N', 'sheet_db_general:r000011'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|6|na|office', '6', null, '사무실', 1848.98, 1443.61, 14834565, 593383, 26523, 1061, 27583.58, '2024-03-01', 'sheet_db_history:r000026', 26, '하중물', true, true, false, 'Y', 'Y', 'N', 'sheet_db_general:r000011'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|7|na|n', '7', null, 'N', 42526.66, 35123.38, 341193662, 13647746, 26522, 1061, 27583.39, '2024-03-01', 'sheet_db_history:r000023', 23, '하중물', true, true, false, 'Y', 'Y', 'N', 'sheet_db_general:r000011'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|8|na|office', '8', null, '사무실', 1848.98, 1443.61, 14834565, 593383, 26523, 1061, 27583.58, '2024-03-01', 'sheet_db_history:r000020', 20, '하중물', true, true, false, 'Y', 'Y', 'N', 'sheet_db_general:r000011'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|9|na|n', '9', null, 'N', 42371.86, 35065.08, 339951879, 13598075, 26523, 1061, 27583.41, '2024-03-01', 'sheet_db_history:r000017', 17, '하중물', true, true, false, 'Y', 'Y', 'N', 'sheet_db_general:r000011'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|10|na|office', '10', null, '사무실', 1845.17, 1445.16, 14803799, 592152, 26522, 1061, 27583.21, '2024-03-01', 'sheet_db_history:r000014', 14, '하중물', true, true, false, 'Y', 'Y', 'N', 'sheet_db_general:r000011'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20230109|20280108', 'asset_a112127001|tenant_brn_1108105034|20230109|20280108|b1|1~5섹터|office', 'B1', '1~5섹터', '사무실', 890.37, 592.47, 10007086, 735815, 37155, 2732, 39886.48, '2026-01-09', 'sheet_db_history:r000044', 44, '하중물', false, true, false, 'Y', 'N', 'N', 'sheet_db_general:r000012'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20250501|20280131', 'asset_a112127001|tenant_brn_1108105034|20250501|20280131|b1|6섹터|office', 'B1', '6섹터', '사무실', 196.95, 129.72, 2234250, 158483, 37502, 2660, 40161.77, '2025-05-01', 'sheet_db_history:r000052', 52, '하중물', false, true, false, 'Y', 'N', 'N', 'sheet_db_general:r000013'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20240201|20280131', 'asset_a112127001|tenant_brn_1108105034|20240201|20280131|b1|7섹터|office', 'B1', '7섹터', '사무실', 749.36, 493.58, 8176484, 601212, 36070, 2652, 38722.61, '2026-02-01', 'sheet_db_history:r000054', 54, '하중물', false, true, false, 'Y', 'N', 'N', 'sheet_db_general:r000014'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20260201|20280131', 'asset_a112127001|tenant_brn_1108105034|20260201|20280131|b1|8~10섹터|office', 'B1', '8~10섹터', '사무실', 114.26, 76.03, 1278720, 103680, 36996, 3000, 39995.78, '2026-02-01', 'sheet_db_history:r000060', 60, '하중물', false, true, false, 'Y', 'N', 'N', 'sheet_db_general:r000015'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20230109|20280108', 'asset_a112127001|tenant_brn_1108105034|20230109|20280108|b2|1~5섹터|n', 'B2', '1~5섹터', 'N', 18416.97, 13984.04, 206982622, 15219310, 37153, 2732, 39884.51, '2026-01-09', 'sheet_db_history:r000048', 48, '하중물', false, true, false, 'Y', 'N', 'N', 'sheet_db_general:r000012'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20250501|20280131', 'asset_a112127001|tenant_brn_1108105034|20250501|20280131|b2|6섹터|n', 'B2', '6섹터', 'N', 3820.95, 2929.92, 43344000, 3074534, 37500, 2660, 40160.09, '2025-05-01', 'sheet_db_history:r000053', 53, '하중물', false, true, false, 'Y', 'N', 'N', 'sheet_db_general:r000013'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20240201|20280131', 'asset_a112127001|tenant_brn_1108105034|20240201|20280131|b2|7섹터|n', 'B2', '7섹터', 'N', 3511.31, 2910.8, 38313109, 2817140, 36071, 2652, 38722.8, '2026-02-01', 'sheet_db_history:r000057', 57, '하중물', false, true, false, 'Y', 'N', 'N', 'sheet_db_general:r000014'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20260201|20280131', 'asset_a112127001|tenant_brn_1108105034|20260201|20280131|b2|8~10섹터|n', 'B2', '8~10섹터', 'N', 10875.92, 9413.28, 121728890, 9869910, 37000, 3000, 40000.05, '2026-02-01', 'sheet_db_history:r000061', 61, '하중물', false, true, false, 'Y', 'N', 'N', 'sheet_db_general:r000015'),
  ('asset_a112127001', 'tenant_brn_2118640630', 'asset_a112127001|tenant_brn_2118640630|20240101|20270331', 'asset_a112127001|tenant_brn_2118640630|20240101|20270331|b2|11섹터|n', 'B2', '11섹터', 'N', 4092.2, 3470.94, 44651435, 3283194, 36071, 2652, 38722.83, '2026-01-01', 'sheet_db_history:r000062', 62, '하중물', false, true, false, 'N', 'N', 'N', 'sheet_db_general:r000016'),
  ('asset_a112127001', 'tenant_brn_2118640630', 'asset_a112127001|tenant_brn_2118640630|20240401|20270331', 'asset_a112127001|tenant_brn_2118640630|20240401|20270331|b2|12섹터|n', 'B2', '12섹터', 'N', 4102.9, 3497.69, 44768304, 3291787, 36071, 2652, 38722.94, '2026-04-01', 'sheet_db_history:r000069', 69, '하중물', false, true, false, 'N', 'N', 'N', 'sheet_db_general:r000017'),
  ('asset_a112127001', 'tenant_brn_2118640630', 'asset_a112127001|tenant_brn_2118640630|20240401|20270331', 'asset_a112127001|tenant_brn_2118640630|20240401|20270331|b2|13~14섹터|n', 'B2', '13~14섹터', 'N', 7994.02, 6792.04, 87225564, 6413644, 36071, 2652, 38722.83, '2026-04-01', 'sheet_db_history:r000076', 76, '하중물, 의약품', false, true, false, 'N', 'N', 'N', 'sheet_db_general:r000018')
)
insert into public.ll_lease_spaces (
  lease_space_id, lease_id, asset_id, tenant_id, floor_label, detail_area_label, temperature_type,
  is_single_tenant, is_preleased, is_3pl, goods_type, leased_area_sqm, exclusive_area_sqm,
  exclusive_ratio, current_monthly_rent_total, current_monthly_mf_total, current_monthly_cost_total, e_noc,
  formula_version, office_use_yn, sublease_yn, contract_status, delinquency_yn, source_sheet_row_id,
  source_payload, review_status, review_note, updated_at
)
select
  lease_space_id, lease_id, asset_id, tenant_id, floor_label, detail_area_label, temperature_type,
  is_single_tenant, is_preleased, is_3pl, goods_type, leased_area_sqm, exclusive_area_sqm,
  case when leased_area_sqm > 0 then exclusive_area_sqm / leased_area_sqm else null end,
  monthly_rent_total, monthly_mf_total, monthly_rent_total + monthly_mf_total, e_noc,
  'E.NOC_v2_excel_db_history_latest_split', office_use_yn, sublease_yn, 'active', delinquency_yn, source_sheet_row_id,
  jsonb_build_object(
    'source_excel_visible_row', source_excel_visible_row,
    'general_source_row_id', general_source_row_id,
    'effective_date', effective_date
  ),
  'excel_db_history_latest_split',
  concat('DB history latest split upsert / Excel row ', source_excel_visible_row::text),
  now()
from latest
on conflict (lease_space_id) do update set
  lease_id = excluded.lease_id,
  tenant_id = excluded.tenant_id,
  floor_label = excluded.floor_label,
  detail_area_label = excluded.detail_area_label,
  temperature_type = excluded.temperature_type,
  is_single_tenant = excluded.is_single_tenant,
  is_preleased = excluded.is_preleased,
  is_3pl = excluded.is_3pl,
  goods_type = excluded.goods_type,
  leased_area_sqm = excluded.leased_area_sqm,
  exclusive_area_sqm = excluded.exclusive_area_sqm,
  exclusive_ratio = excluded.exclusive_ratio,
  current_monthly_rent_total = excluded.current_monthly_rent_total,
  current_monthly_mf_total = excluded.current_monthly_mf_total,
  current_monthly_cost_total = excluded.current_monthly_cost_total,
  e_noc = excluded.e_noc,
  formula_version = excluded.formula_version,
  office_use_yn = excluded.office_use_yn,
  sublease_yn = excluded.sublease_yn,
  contract_status = 'active',
  delinquency_yn = excluded.delinquency_yn,
  source_sheet_row_id = excluded.source_sheet_row_id,
  source_payload = excluded.source_payload,
  review_status = excluded.review_status,
  review_note = excluded.review_note,
  updated_at = now();

with latest(asset_id, tenant_id, lease_space_id, floor_label, detail_area_label, temperature_type, effective_date) as (
  values
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|1|na|n', '1', null, 'N', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|2|na|office', '2', null, '사무실', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|3|na|n', '3', null, 'N', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|4|na|office', '4', null, '사무실', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|5|na|n', '5', null, 'N', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|6|na|office', '6', null, '사무실', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|7|na|n', '7', null, 'N', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|8|na|office', '8', null, '사무실', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|9|na|n', '9', null, 'N', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|10|na|office', '10', null, '사무실', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20230109|20280108|b1|1~5섹터|office', 'B1', '1~5섹터', '사무실', '2026-01-09'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20250501|20280131|b1|6섹터|office', 'B1', '6섹터', '사무실', '2025-05-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20240201|20280131|b1|7섹터|office', 'B1', '7섹터', '사무실', '2026-02-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20260201|20280131|b1|8~10섹터|office', 'B1', '8~10섹터', '사무실', '2026-02-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20230109|20280108|b2|1~5섹터|n', 'B2', '1~5섹터', 'N', '2026-01-09'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20250501|20280131|b2|6섹터|n', 'B2', '6섹터', 'N', '2025-05-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20240201|20280131|b2|7섹터|n', 'B2', '7섹터', 'N', '2026-02-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20260201|20280131|b2|8~10섹터|n', 'B2', '8~10섹터', 'N', '2026-02-01'),
  ('asset_a112127001', 'tenant_brn_2118640630', 'asset_a112127001|tenant_brn_2118640630|20240101|20270331|b2|11섹터|n', 'B2', '11섹터', 'N', '2026-01-01'),
  ('asset_a112127001', 'tenant_brn_2118640630', 'asset_a112127001|tenant_brn_2118640630|20240401|20270331|b2|12섹터|n', 'B2', '12섹터', 'N', '2026-04-01'),
  ('asset_a112127001', 'tenant_brn_2118640630', 'asset_a112127001|tenant_brn_2118640630|20240401|20270331|b2|13~14섹터|n', 'B2', '13~14섹터', 'N', '2026-04-01')
)
update public.ll_lease_spaces ls
set
  contract_status = 'superseded_by_db_history_split',
  review_status = 'superseded_by_db_history_split',
  review_note = concat_ws(' / ', nullif(ls.review_note, ''), 'Superseded by 21-row DB history latest split on 2026-05-19'),
  updated_at = now()
where ls.asset_id = 'asset_a112127001'
  and not exists (
    select 1
    from latest
    where latest.lease_space_id = ls.lease_space_id
  );

with latest(asset_id, tenant_id, lease_space_id, floor_label, detail_area_label, temperature_type, effective_date) as (
  values
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|1|na|n', '1', null, 'N', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|2|na|office', '2', null, '사무실', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|3|na|n', '3', null, 'N', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|4|na|office', '4', null, '사무실', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|5|na|n', '5', null, 'N', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|6|na|office', '6', null, '사무실', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|7|na|n', '7', null, 'N', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|8|na|office', '8', null, '사무실', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|9|na|n', '9', null, 'N', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20190301|20340228|10|na|office', '10', null, '사무실', '2024-03-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20230109|20280108|b1|1~5섹터|office', 'B1', '1~5섹터', '사무실', '2026-01-09'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20250501|20280131|b1|6섹터|office', 'B1', '6섹터', '사무실', '2025-05-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20240201|20280131|b1|7섹터|office', 'B1', '7섹터', '사무실', '2026-02-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20260201|20280131|b1|8~10섹터|office', 'B1', '8~10섹터', '사무실', '2026-02-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20230109|20280108|b2|1~5섹터|n', 'B2', '1~5섹터', 'N', '2026-01-09'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20250501|20280131|b2|6섹터|n', 'B2', '6섹터', 'N', '2025-05-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20240201|20280131|b2|7섹터|n', 'B2', '7섹터', 'N', '2026-02-01'),
  ('asset_a112127001', 'tenant_brn_1108105034', 'asset_a112127001|tenant_brn_1108105034|20260201|20280131|b2|8~10섹터|n', 'B2', '8~10섹터', 'N', '2026-02-01'),
  ('asset_a112127001', 'tenant_brn_2118640630', 'asset_a112127001|tenant_brn_2118640630|20240101|20270331|b2|11섹터|n', 'B2', '11섹터', 'N', '2026-01-01'),
  ('asset_a112127001', 'tenant_brn_2118640630', 'asset_a112127001|tenant_brn_2118640630|20240401|20270331|b2|12섹터|n', 'B2', '12섹터', 'N', '2026-04-01'),
  ('asset_a112127001', 'tenant_brn_2118640630', 'asset_a112127001|tenant_brn_2118640630|20240401|20270331|b2|13~14섹터|n', 'B2', '13~14섹터', 'N', '2026-04-01')
)
update public.ll_rent_history rh
set
  lease_space_id = latest.lease_space_id,
  source_contract_lease_space_id = latest.lease_space_id,
  updated_at = now()
from latest
where rh.asset_id = latest.asset_id
  and rh.tenant_id = latest.tenant_id
  and coalesce(rh.floor_label, '') = coalesce(latest.floor_label, '')
  and coalesce(rh.detail_area_label, '') = coalesce(latest.detail_area_label, '')
  and coalesce(rh.temperature_type, '') = coalesce(latest.temperature_type, '');

with ranked as (
  select
    rent_history_id,
    row_number() over (
      partition by asset_id, tenant_id, coalesce(floor_label, ''), coalesce(detail_area_label, ''), coalesce(temperature_type, '')
      order by effective_date desc nulls last, source_excel_visible_row desc nulls last, source_sheet_row_id desc
    ) = 1 as next_is_latest
  from public.ll_rent_history
  where asset_id = 'asset_a112127001'
)
update public.ll_rent_history rh
set
  is_latest = ranked.next_is_latest,
  updated_at = now()
from ranked
where rh.rent_history_id = ranked.rent_history_id;

insert into public.ll_api_audit_logs (action, status_code, requested_by, request_payload)
values (
  'data/asset_a112127001/db_history_latest_split',
  200,
  null,
  jsonb_build_object(
    'asset_id', 'asset_a112127001',
    'source_workbook', '★ 260414_물류센터 임대차계약 DB_취합본.xlsx',
    'latest_split_rows', 21,
    'mutation_scope', 'public.ll_lease_spaces + public.ll_rent_history',
    'applied_at', now()
  )
);
