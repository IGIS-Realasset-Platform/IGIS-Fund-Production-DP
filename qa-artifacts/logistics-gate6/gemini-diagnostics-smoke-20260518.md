# Gemini 2.5 Flash diagnostics smoke - 2026-05-18

## Scope
- Project: qvegpozwrcmspdvjokiz
- Edge Function: ll-dashboard-api
- Preview URL origin: https://kylee94.github.io
- Preview path: /logistics-gate6-preview/
- Model: gemini-2.5-flash

## Edge diagnostics smoke
- Request action: ai/gemini-diagnostics
- Origin header: https://kylee94.github.io
- HTTP status: 200
- Access-Control-Allow-Origin: https://kylee94.github.io
- edge_reached: true
- origin_allowed: true
- demo_origin_allowed: true
- gemini_ok: true
- provider_status: 200
- key_configured: true
- key_hash: 59eff6b58ab2
- answer_preview: Gemini diagnostics OK

## Demo search smoke
- Request action: ai/search-chat-demo
- Origin header: https://kylee94.github.io
- HTTP status: 200
- Access-Control-Allow-Origin: https://kylee94.github.io
- ok: true
- mode: demo
- model: gemini-2.5-flash
- evidence_count: 12

## Preview bundle readback
- URL: https://kylee94.github.io/logistics-gate6-preview/
- Cache-busted HTML readback asset: assets/index-C0-xFOHk.js
- JS status: 200
- JS contains ai/gemini-diagnostics: true
- JS contains connection diagnostics button text: true
- JS contains separated Edge Function failure message: true

## Local QA
- eslint: pass
- edge-api-security-static-qa-20260514: allPass=true, logisticsGatePass=true
- repo-secret-hygiene-20260513: allPass=true
- npm run build -- --base=/logistics-gate6-preview/: pass

## Browser QA Fix 1
- Issue observed from live browser: `Failed to send a request to the Edge Function`.
- Root cause: browser preflight includes the Supabase `apikey` header, but `ll-dashboard-api` CORS response only allowed `authorization, content-type, x-client-info`.
- Fix: add `apikey` to `access-control-allow-headers`.
- Preflight readback:
  - Origin: https://kylee94.github.io
  - Access-Control-Request-Headers: apikey, authorization, content-type, x-client-info
  - HTTP status: 200
  - Access-Control-Allow-Headers: apikey, authorization, content-type, x-client-info

## Browser QA Fix 2
- Issue observed from live browser: no-login preview first tries authenticated `ai/search-chat` and receives 401, but demo fallback was limited to `user.is_demo`.
- Fix: allow preview demo fallback on `kylee94.github.io`, localhost, and 127.0.0.1 when primary AI action fails.

## Actual Edge Browser E2E
- Browser: installed Microsoft Edge headless, real CORS enabled.
- URL: https://kylee94.github.io/logistics-gate6-preview/
- User action: click `연결 진단`.
- Observed network:
  - POST `ai/gemini-diagnostics`: 200
  - CORS allow origin: https://kylee94.github.io
- User action: type `show logistics assets summary`, click `AI 답변`.
- Observed network:
  - POST `ai/search-chat`: 401, expected in no-login preview
  - POST `ai/search-chat-demo`: 200
- Observed rendered text:
  - `다음은 물류 자산 요약입니다`
  - `Gemini 연결이 확인되었습니다`
  - `Gemini OK`
  - `gemini-2.5-flash`
- Result: browser E2E pass.
