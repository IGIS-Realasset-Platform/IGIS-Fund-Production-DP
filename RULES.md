# 프로젝트 기본 규칙 (RULES.md)

이 문서는 IGIS Fund Production DP 프로젝트를 진행하는 데 있어 **절대적으로 준수해야 할 핵심 아키텍처, 보안, UI/UX 규칙**을 정의합니다. AI 어시스턴트는 매 세션 시작 및 코드 구현 전 이 문서를 최우선으로 숙지하고 반영해야 합니다.

## 1. 보안 및 데이터 아키텍처 (Security & Data Architecture)

> [!CAUTION]
> **Supabase 스토리지 버킷은 무조건 프라이빗(Private)으로 유지합니다.**

- **퍼블릭 버킷 금지**: 보안 정책상 Supabase의 어떠한 Storage Bucket(예: `task-attachments` 등)도 Public으로 설정하지 않습니다.
- **파일 접근 방식**: 파일 조회 및 다운로드 시 **절대 `getPublicUrl`을 사용하지 않으며**, 반드시 `createSignedUrl` 메서드를 사용하여 임시 보안 토큰 기반의 다운로드 로직을 구현해야 합니다.
  ```javascript
  // ❌ 금지된 방식
  const url = supabase.storage.from('bucket').getPublicUrl(path);

  // ✅ 올바른 방식 (Signed URL 사용)
  const { data } = await supabase.storage.from('bucket').createSignedUrl(path, 60);
  const response = await fetch(data.signedUrl);
  ```

## 2. 디자인 시스템 및 UI/UX (Design & Aesthetics)

> [!IMPORTANT]
> **Apple 스타일의 프리미엄 미니멀리즘(Premium Minimalism)을 지향합니다.**

- **색상 및 타이포그래피**: 원색(순수 빨강/파랑 등) 사용을 지양하고, 세련된 다크 모드 기반의 HSL/HEX 색상 조합(예: `#A1A1AA`, `#222`, `#333`, `#E5E5E5`)을 사용합니다.
- **박스 및 컨테이너 배경색 주의**: 신규 박스나 컨테이너를 디자인할 때 배경색을 무식하게 완전한 까만색(`#000000` 또는 `bg-black`)으로 채워 넣는 것을 엄격히 금지합니다. 미세한 깊이감을 주는 `#1a1a1a`, `#222`, `#2A2A2A` 등의 다크톤 그라데이션 및 레이어를 활용하여 고급스러운 질감을 유지합니다.
- **여백과 정렬**: 컴포넌트 간의 간격을 픽셀 단위로 정교하게 맞추며, 불필요한 패딩이나 마진을 제거하여 정돈된 화면을 구성합니다.
- **마이크로 인터랙션**: 모든 버튼과 상호작용 가능한 요소에는 부드러운 `hover` 효과(예: `transition-colors`, `hover:bg-[#333]`)를 적용합니다.
- **마우스 커서 (Cursor)**: "우측 날개(Right Wing/Panel)"를 포함한 모든 버튼, 아이콘, 탭 등 클릭 가능한(Interactive) 요소에는 마우스를 올렸을 때 기본적으로 손가락 모양이 나타나도록 반드시 `cursor-pointer` 클래스를 적용합니다.

## 3. 기능 및 레이아웃 제약 (Functional Constraints)

- **댓글 내 파일 첨부 금지**: 워크스페이스나 게시판의 댓글(`commentContent`) 시스템에는 파일 업로드 폼이나 첨부 기능을 일절 노출하지 않으며 텍스트 기반으로만 유지합니다.
- **상태 기반 라우팅 동기화**: SPA 구조에서 페이지 이동 시 불필요한 전체 로딩 화면을 방지하고 DOM 안정성을 확보한 후 렌더링하는 패턴을 따릅니다.

---
*💡 이 파일은 AI가 프로젝트의 컨텍스트를 유지하고, 반복적인 실수(예: 퍼블릭 버킷 사용)를 방지하기 위한 핵심 지침서입니다. 기능 추가 시 항상 이 문서를 기준으로 의사결정을 내립니다.*
