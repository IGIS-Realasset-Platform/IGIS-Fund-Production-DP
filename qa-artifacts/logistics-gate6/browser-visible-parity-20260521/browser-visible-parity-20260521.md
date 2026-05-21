# Browser Visible Parity - 2026-05-21

- Base URL: `http://127.0.0.1:4177/logistics-gate6-preview/`
- Status: **pass**
- Auth mode: real Supabase Auth session injected into sb-iota-auth-token for browser-visible parity.

| Page | Status | Required actions | Seen actions | Missing text | Forbidden text | Failed Edge responses | Screenshot |
| --- | --- | --- | --- | --- | --- | --- | --- |
| home | pass | dashboard/home/read | dashboard/home/read, work-platform/tasks/list, work-platform/tasks/snapshots/upsert-current, naver/maps-config |  |  |  | qa-artifacts/logistics-gate6/browser-visible-parity-20260521/home.png |
| asset | pass | dashboard/home/read, dashboard/asset/read | weekly-assets/latest, dashboard/home/read, dashboard/asset/read, work-platform/tasks/list, work-platform/tasks/snapshots/upsert-current, weekly-projects/get-asset-detail, funds/read-by-asset |  |  |  | qa-artifacts/logistics-gate6/browser-visible-parity-20260521/asset.png |
| company | pass | dashboard/home/read, dashboard/company/read | dashboard/home/read, work-platform/tasks/list, work-platform/tasks/snapshots/upsert-current, dashboard/company/read, naver/maps-config |  |  |  | qa-artifacts/logistics-gate6/browser-visible-parity-20260521/company.png |
| pdf-report | pass | dashboard/home/read | weekly-assets/latest, dashboard/home/read, work-platform/tasks/list, work-platform/tasks/snapshots/upsert-current, dashboard/asset/read, funds/read-by-asset |  |  |  | qa-artifacts/logistics-gate6/browser-visible-parity-20260521/pdf-report.png |
| analysis-tools | pass | dashboard/home/read | dashboard/home/read, work-platform/tasks/list, work-platform/tasks/snapshots/upsert-current |  |  |  | qa-artifacts/logistics-gate6/browser-visible-parity-20260521/analysis-tools.png |
| pivot-table | pass | dashboard/home/read | dashboard/home/read, work-platform/tasks/list, work-platform/tasks/snapshots/upsert-current |  |  |  | qa-artifacts/logistics-gate6/browser-visible-parity-20260521/pivot-table.png |
