#!/bin/bash

# 에러 발생 시 스크립트 중단
set -e

# 프로젝트 루트 디렉토리로 이동 (스크립트 위치 기준)
cd "$(dirname "$0")"

echo "🔍 변경된 파일 감지 중..."
git status -s

# 변경 사항이 없는지 확인
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ 커밋할 변경 사항이 없습니다."
  exit 0
fi

# 1. git add
echo "➕ 모든 변경 사항 스테이징 중 (git add .)..."
git add .

# 2. 커밋 메시지 결정
COMMIT_MSG=$1
if [ -z "$COMMIT_MSG" ]; then
  # 인자가 없으면 변경 사항을 바탕으로 간단히 생성 시도
  CHANGED_FILES=$(git diff --name-only --cached)
  
  if echo "$CHANGED_FILES" | grep -q "IotaMyPage.jsx"; then
    COMMIT_MSG="feat: refine MY Workspace UI and redirection error messages"
  elif echo "$CHANGED_FILES" | grep -q "tasksData.js"; then
    COMMIT_MSG="docs: update admin task log details"
  else
    COMMIT_MSG="chore: automatic commit update - $(date '+%Y-%m-%d %H:%M:%S')"
  fi
fi

# 3. git commit
echo "💾 커밋 생성 중: \"$COMMIT_MSG\""
git commit -m "$COMMIT_MSG"

# 4. git push
echo "🚀 원격 저장소로 업로드 중 (git push origin main)..."
if git push origin main; then
  echo "🎉 성공적으로 커밋 및 푸시가 완료되었습니다!"
else
  echo "⚠️  원격 푸시 실패 (인증 권한 문제 가능성)."
  echo "👉 로컬 커밋은 완료되었으니, 터미널에서 직접 'git push'를 실행해 주세요."
fi
