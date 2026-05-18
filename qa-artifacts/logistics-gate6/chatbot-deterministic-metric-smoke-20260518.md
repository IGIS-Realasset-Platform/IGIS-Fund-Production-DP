# Chatbot deterministic metric smoke - 2026-05-18

- Target: `https://qvegpozwrcmspdvjokiz.supabase.co/functions/v1/ll-dashboard-api`
- Origin header: `https://kylee94.github.io`
- Action: `ai/search-chat-demo`
- Provider path: Edge deterministic answer before LLM provider
- DB metric table: `public.ll_dashboard_metric_snapshots`

| question | mode | answer | status |
|---|---|---|---|
| 인천 석남 물류센터 e. noc 얼마야? | deterministic_metric_snapshot | 인천석남물류센터의 E. NOC는 31,633원입니다. | pass |
| 아레나스 양지에서 가장 많은 면적 임차하고 있는 임차인 누구야? | deterministic_metric_snapshot | 아레나스양지물류센터에서 가장 많은 면적을 임차한 임차인은 씨제이대한통운(주)이고, 임대면적은 77,448.8평입니다. | pass |
| 지금 내가 데이터 분석할 수 있는 자산이 몇 개야? | deterministic_asset_count | 현재 읽기 권한 범위에서 조회 가능한 자산은 17개입니다. | pass |
| 경산 쿠팡 물류센터 e.noc는? | deterministic_metric_snapshot | 경산 쿠팡물류센터의 E. NOC는 48,216원입니다. | pass |

## Readback

- `인천석남물류센터.average_e_noc`: `31,632.69`
- `아레나스양지물류센터.top_tenant_by_leased_area`: `씨제이대한통운(주)`, `77,448.83평`
- `경산 쿠팡물류센터.average_e_noc`: `48,215.98`

## Notes

- PowerShell `Invoke-RestMethod` can send Korean request bodies with a non-UTF8 encoding in this environment; Node `fetch` with `content-type: application/json; charset=utf-8` was used for the final smoke.
- The earlier wrong answers were caused by two issues: the chatbot relied on LLM generation for numeric aggregation, and the Edge search context was still reading a legacy candidate table name instead of the live `ll_lease_spaces + ll_tenants + ll_assets` structure.
