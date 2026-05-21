-- Gate 6 fund overview rollback preview.
-- Do not run without explicit user approval.
-- This only removes additive fund overview objects from this batch.

begin;

drop table if exists public.ll_fund_loan_tranches;
drop table if exists public.ll_fund_beneficiary_tranches;
drop table if exists public.ll_fund_asset_links;
drop table if exists public.ll_funds;

insert into public.ll_api_audit_logs (action, status_code, requested_by, request_payload)
values (
  'rollback/add-logistics-fund-overview',
  200,
  null,
  jsonb_build_object(
    'migration', '20260520081005_add_logistics_fund_overview',
    'mode', 'rollback_preview'
  )
);

-- Replace rollback with commit only after approval and live impact review.
rollback;
