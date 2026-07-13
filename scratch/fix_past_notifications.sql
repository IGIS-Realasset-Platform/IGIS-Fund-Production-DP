-- 1. 단발성 업무(UUID 형식의 task_id)에 연결된 시스템 로그 및 사용자가 작성한 로그의 워크스페이스 메타데이터를 'WS_PMO' 및 '단발성 업무 요청'으로 수정
UPDATE public.iota_seoul_logs
SET metadata = jsonb_set(
                 jsonb_set(
                   COALESCE(metadata, '{}'::jsonb), 
                   '{workspace_code}', 
                   '"WS_PMO"'::jsonb
                 ), 
                 '{workspace_label}', 
                 '"단발성 업무 요청"'::jsonb
               )
WHERE metadata->>'task_id' LIKE '%-%-%-%-%';

-- 2. 해당 단발성 업무 로그(log_id)에 매핑된 알림의 타이틀을 '[단발성 업무 요청]에 새 글이 등록됐습니다.'로 일괄 갱신
UPDATE public.iota_notifications n
SET title = '[단발성 업무 요청]에 새 글이 등록됐습니다.'
FROM public.iota_seoul_logs l
WHERE SPLIT_PART(n.reference_id, '|', 1) = l.log_id
  AND l.metadata->>'task_id' LIKE '%-%-%-%-%';

-- 3. 다른 모든 알림의 타이틀에서 [협업] 프리픽스 소급 제거 (공통)
UPDATE public.iota_notifications
SET title = REPLACE(title, '[협업]', '')
WHERE title LIKE '[협업]%';
