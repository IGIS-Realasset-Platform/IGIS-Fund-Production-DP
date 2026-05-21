# Supabase public.ll_* Catalog Inventory - 2026-05-21

- Project: `qvegpozwrcmspdvjokiz`
- Scope: `public.ll_*`
- Mode: read-only catalog inventory via `npx supabase db query --linked`
- This artifact does not execute cleanup, DROP, DELETE, RLS, policy, or grant changes.

## Summary

| Metric | Value |
| --- | --- |
| table_count | 34 |
| column_count | 618 |
| constraint_count | 112 |
| index_count | 127 |
| policy_count | 11 |
| grant_count | 942 |
| missing_primary_key_count | 0 |
| missing_fk_index_count | 0 |
| rls_disabled_count | 0 |
| cleanup_candidate_count | 0 |

## Table Matrix

| Table | Rows | Columns | PK | FKs | Indexes | RLS | Policies | Grants | Group | Decision | Local uses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ll_api_audit_logs | 698 | 6 | id | 1 | 2 | enabled | 1 | 28 | Permission / Audit | delete_prohibited | 70 |
| ll_asset_managers | 17 | 13 | asset_manager_id | 2 | 3 | enabled | 0 | 28 | Core Normalized | keep | 71 |
| ll_assets | 17 | 23 | asset_id | 1 | 3 | enabled | 0 | 28 | Core Normalized | keep | 245 |
| ll_cache_entries | 67 | 30 | id | 0 | 5 | enabled | 0 | 28 | Cache / Snapshot | keep | 98 |
| ll_data_change_audit_logs | 4 | 17 | id | 3 | 5 | enabled | 1 | 28 | Permission / Audit | delete_prohibited | 99 |
| ll_data_quality_findings | 51 | 16 | finding_id | 0 | 3 | enabled | 0 | 28 | Permission / Audit | delete_prohibited | 108 |
| ll_edit_requests | 4 | 28 | id | 3 | 5 | enabled | 1 | 28 | Permission / Audit | delete_prohibited | 136 |
| ll_fund_asset_links | 17 | 14 | id | 2 | 4 | enabled | 0 | 28 | Fund | keep | 119 |
| ll_fund_beneficiary_tranches | 52 | 19 | id | 3 | 5 | enabled | 0 | 28 | Fund | keep | 113 |
| ll_fund_loan_tranches | 51 | 32 | id | 3 | 6 | enabled | 0 | 28 | Fund | keep | 164 |
| ll_funds | 15 | 19 | fund_id | 0 | 3 | enabled | 0 | 28 | Fund | keep | 157 |
| ll_import_runs | 4 | 11 | import_id | 0 | 1 | enabled | 0 | 24 | Raw Source | delete_prohibited | 58 |
| ll_issues | 42 | 16 | issue_id | 3 | 4 | enabled | 0 | 28 | Work Platform / Weekly | keep | 72 |
| ll_lease_space_area_breakdowns | 387 | 17 | id | 4 | 5 | enabled | 0 | 28 | Detail Normalized | keep | 130 |
| ll_lease_space_specs | 513 | 18 | id | 4 | 5 | enabled | 0 | 28 | Detail Normalized | keep | 143 |
| ll_lease_spaces | 80 | 31 | lease_space_id | 4 | 5 | enabled | 0 | 28 | Core Normalized | keep | 313 |
| ll_lease_special_terms | 1758 | 18 | id | 4 | 5 | enabled | 0 | 28 | Detail Normalized | keep | 132 |
| ll_leases | 45 | 33 | lease_id | 3 | 4 | enabled | 0 | 28 | Core Normalized | keep | 209 |
| ll_migration_row_backups | 214 | 6 | id | 0 | 2 | enabled | 0 | 28 | Migration Safety | delete_prohibited | 66 |
| ll_rent_history | 163 | 26 | rent_history_id | 6 | 8 | enabled | 0 | 28 | Core Normalized | keep | 298 |
| ll_schema_metadata | 682 | 17 | metadata_id | 0 | 3 | enabled | 0 | 28 | Metadata | keep | 64 |
| ll_sheet_rows | 347 | 10 | sheet_row_id | 1 | 3 | enabled | 0 | 28 | Raw Source | delete_prohibited | 93 |
| ll_source_cells | 196657 | 27 | source_cell_id | 1 | 5 | enabled | 0 | 22 | Raw Source | delete_prohibited | 168 |
| ll_source_field_registry | 134 | 21 | source_field_id | 1 | 4 | enabled | 0 | 28 | Raw Source | delete_prohibited | 95 |
| ll_source_review_logs | 35 | 15 | id | 0 | 3 | enabled | 0 | 28 | Raw Source | delete_prohibited | 78 |
| ll_tenants | 36 | 16 | tenant_id | 1 | 3 | enabled | 0 | 28 | Core Normalized | keep | 196 |
| ll_user_permissions | 9 | 10 | user_id | 0 | 1 | enabled | 1 | 28 | Permission / Audit | delete_prohibited | 120 |
| ll_weekly_assets | 20 | 11 | id | 1 | 2 | enabled | 1 | 28 | Work Platform / Weekly | keep | 120 |
| ll_weekly_doc_ingest_runs | 0 | 11 | id | 2 | 3 | enabled | 1 | 28 | Work Platform / Weekly | keep | 73 |
| ll_weekly_projects | 5 | 10 | id | 1 | 2 | enabled | 1 | 28 | Work Platform / Weekly | keep | 91 |
| ll_weekly_reports | 1 | 13 | id | 1 | 3 | enabled | 1 | 28 | Work Platform / Weekly | keep | 104 |
| ll_work_platform_board_posts | 3 | 27 | id | 2 | 4 | enabled | 1 | 28 | Work Platform / Weekly | keep | 105 |
| ll_work_platform_task_snapshots | 2 | 16 | id | 1 | 4 | enabled | 1 | 28 | Work Platform / Weekly | keep | 84 |
| ll_work_platform_tasks | 2 | 21 | id | 3 | 4 | enabled | 1 | 28 | Work Platform / Weekly | keep | 132 |

## FK Index Coverage

| Table | Constraint | Columns | Supporting index |
| --- | --- | --- | --- |
| ll_api_audit_logs | ll_api_audit_logs_requested_by_fkey | requested_by | yes |
| ll_asset_managers | ll_asset_managers_asset_id_fkey | asset_id | yes |
| ll_asset_managers | ll_asset_managers_source_sheet_row_id_fkey | source_sheet_row_id | yes |
| ll_assets | ll_assets_source_sheet_row_id_fkey | source_sheet_row_id | yes |
| ll_data_change_audit_logs | ll_data_change_audit_logs_actor_id_fkey | actor_id | yes |
| ll_data_change_audit_logs | ll_data_change_audit_logs_approver_id_fkey | approver_id | yes |
| ll_data_change_audit_logs | ll_data_change_audit_logs_edit_request_id_fkey | edit_request_id | yes |
| ll_edit_requests | ll_edit_requests_approved_by_fkey | approved_by | yes |
| ll_edit_requests | ll_edit_requests_rejected_by_fkey | rejected_by | yes |
| ll_edit_requests | ll_edit_requests_requested_by_fkey | requested_by | yes |
| ll_fund_asset_links | ll_fund_asset_links_asset_id_fkey | asset_id | yes |
| ll_fund_asset_links | ll_fund_asset_links_fund_id_fkey | fund_id | yes |
| ll_fund_beneficiary_tranches | ll_fund_beneficiary_tranches_created_by_fkey | created_by | yes |
| ll_fund_beneficiary_tranches | ll_fund_beneficiary_tranches_fund_id_fkey | fund_id | yes |
| ll_fund_beneficiary_tranches | ll_fund_beneficiary_tranches_updated_by_fkey | updated_by | yes |
| ll_fund_loan_tranches | ll_fund_loan_tranches_created_by_fkey | created_by | yes |
| ll_fund_loan_tranches | ll_fund_loan_tranches_fund_id_fkey | fund_id | yes |
| ll_fund_loan_tranches | ll_fund_loan_tranches_updated_by_fkey | updated_by | yes |
| ll_issues | ll_issues_asset_id_fkey | asset_id | yes |
| ll_issues | ll_issues_source_sheet_row_id_fkey | source_sheet_row_id | yes |
| ll_issues | ll_issues_tenant_id_fkey | tenant_id | yes |
| ll_lease_space_area_breakdowns | ll_lease_space_area_breakdowns_asset_id_fkey | asset_id | yes |
| ll_lease_space_area_breakdowns | ll_lease_space_area_breakdowns_lease_space_id_fkey | lease_space_id | yes |
| ll_lease_space_area_breakdowns | ll_lease_space_area_breakdowns_source_cell_id_fkey | source_cell_id | yes |
| ll_lease_space_area_breakdowns | ll_lease_space_area_breakdowns_tenant_id_fkey | tenant_id | yes |
| ll_lease_space_specs | ll_lease_space_specs_asset_id_fkey | asset_id | yes |
| ll_lease_space_specs | ll_lease_space_specs_lease_space_id_fkey | lease_space_id | yes |
| ll_lease_space_specs | ll_lease_space_specs_source_cell_id_fkey | source_cell_id | yes |
| ll_lease_space_specs | ll_lease_space_specs_tenant_id_fkey | tenant_id | yes |
| ll_lease_spaces | ll_lease_spaces_asset_id_fkey | asset_id | yes |
| ll_lease_spaces | ll_lease_spaces_lease_id_fkey | lease_id | yes |
| ll_lease_spaces | ll_lease_spaces_source_sheet_row_id_fkey | source_sheet_row_id | yes |
| ll_lease_spaces | ll_lease_spaces_tenant_id_fkey | tenant_id | yes |
| ll_lease_special_terms | ll_lease_special_terms_asset_id_fkey | asset_id | yes |
| ll_lease_special_terms | ll_lease_special_terms_lease_space_id_fkey | lease_space_id | yes |
| ll_lease_special_terms | ll_lease_special_terms_source_cell_id_fkey | source_cell_id | yes |
| ll_lease_special_terms | ll_lease_special_terms_tenant_id_fkey | tenant_id | yes |
| ll_leases | ll_leases_asset_id_fkey | asset_id | yes |
| ll_leases | ll_leases_source_sheet_row_id_fkey | source_sheet_row_id | yes |
| ll_leases | ll_leases_tenant_id_fkey | tenant_id | yes |
| ll_rent_history | ll_rent_history_asset_id_fkey | asset_id | yes |
| ll_rent_history | ll_rent_history_lease_id_fkey | lease_id | yes |
| ll_rent_history | ll_rent_history_lease_space_id_fkey | lease_space_id | yes |
| ll_rent_history | ll_rent_history_source_contract_lease_space_id_fkey | source_contract_lease_space_id | yes |
| ll_rent_history | ll_rent_history_source_sheet_row_id_fkey | source_sheet_row_id | yes |
| ll_rent_history | ll_rent_history_tenant_id_fkey | tenant_id | yes |
| ll_sheet_rows | ll_sheet_rows_import_id_fkey | import_id | yes |
| ll_source_cells | ll_source_cells_import_id_fkey | import_id | yes |
| ll_source_field_registry | ll_source_field_registry_source_cell_id_fkey | source_cell_id | yes |
| ll_tenants | ll_tenants_source_sheet_row_id_fkey | source_sheet_row_id | yes |
| ll_weekly_assets | ll_weekly_assets_report_id_fkey | report_id | yes |
| ll_weekly_doc_ingest_runs | ll_weekly_doc_ingest_runs_report_id_fkey | report_id | yes |
| ll_weekly_doc_ingest_runs | ll_weekly_doc_ingest_runs_requested_by_fkey | requested_by | yes |
| ll_weekly_projects | ll_weekly_projects_report_id_fkey | report_id | yes |
| ll_weekly_reports | ll_weekly_reports_created_by_fkey | created_by | yes |
| ll_work_platform_board_posts | ll_work_platform_board_posts_created_by_fkey | created_by | yes |
| ll_work_platform_board_posts | ll_work_platform_board_posts_related_asset_id_fkey | related_asset_id | yes |
| ll_work_platform_task_snapshots | ll_work_platform_task_snapshots_created_by_fkey | created_by | yes |
| ll_work_platform_tasks | ll_work_platform_tasks_created_by_fkey | created_by | yes |
| ll_work_platform_tasks | ll_work_platform_tasks_related_asset_id_fkey | related_asset_id | yes |
| ll_work_platform_tasks | ll_work_platform_tasks_related_tenant_id_fkey | related_tenant_id | yes |

## Cleanup Candidate Classification

| Table | Rows | Group | Decision | Local uses | Reason |
| --- | --- | --- | --- | --- | --- |

## Required Gates Before Cleanup

- Browser-visible parity for Home, Asset, Company, PDF Report, Analysis Tools, and Pivot Table.
- SQL preview, impact scope, rollback/export plan, readback query, and user approval.
- No static fallback data exposure for 401/403 responses.
- No cleanup of raw source, core normalized, permission, audit, or source-cell evidence tables.
