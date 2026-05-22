# Supabase 푸시 알림 연동 가이드

팀원분께 Supabase 초대를 받으신 후, 아래의 3가지 설정을 차례대로 진행해 주시면 푸시 알림 백엔드 준비가 완료됩니다.

---

### 1. DB 테이블 생성하기
Supabase 데이터베이스에 '사용자별 기기 토큰'과 '알림 내역'을 저장할 전용 테이블을 생성합니다.

1. [Supabase 대시보드](https://supabase.com/dashboard)에 접속하여 프로젝트에 들어갑니다.
2. 좌측 메뉴에서 **SQL Editor**를 엽니다.
3. 프로젝트 내에 미리 생성해 둔 아래 경로의 파일을 엽니다.
   > `C:\grus.py\org\igis_fund_mobile\supabase\migrations\00_create_notifications.sql`
4. 위 파일 안의 전체 텍스트(SQL 쿼리)를 복사하여 SQL Editor에 붙여넣습니다.
5. 우측 하단의 **RUN** 버튼을 눌러 실행합니다. (성공 시 하단에 `Success` 문구가 표시됩니다.)

---

### 2. Firebase '관리자 키'를 비밀 키(Secret)로 등록하기
Firebase에서 다운로드 받은 `iota-seoul-firebase-adminsdk...json` 파일 안의 내용을 통째로 복사해서, Supabase가 푸시를 쏠 권한을 가지도록 시크릿 변수에 넣어주어야 합니다.

1. Supabase 콘솔 좌측 하단의 톱니바퀴(⚙️ **Project Settings**)를 누릅니다.
2. 좌측 메뉴에서 **Edge Functions** 탭을 클릭합니다.
3. 화면 중앙의 **Secrets** 항목에서 **[Add new secret]** 버튼을 누릅니다.
4. **Name** 칸에는 정확히 다음 변수명을 적습니다:
   > `FIREBASE_SERVICE_ACCOUNT_KEY`
5. **Value** 칸에는 다운로드했던 **.json 파일 안의 텍스트 전체**를 복사해서 붙여넣고 저장(Add)합니다.

---

### 3. Edge Function (푸시 알림 서버 로직) 배포하기
게시판에 새 글이 올라오거나 댓글이 달릴 때 실제로 푸시를 발송하는 로직을 Supabase 서버에 올립니다.

1. Supabase 콘솔 좌측 메뉴에서 **Edge Functions** (또는 Functions) 메뉴로 들어갑니다.
2. 우측 상단 혹은 화면 중앙의 **[Create a new Function]** 버튼을 누릅니다.
3. **Function name (함수 이름)**에 정확히 다음 이름을 적습니다:
   > `send-push-notification`
4. 브라우저상에서 코드를 입력할 수 있는 에디터 창이 나타나면, 프로젝트 내에 생성해 둔 아래 파일을 엽니다.
   > `C:\grus.py\org\igis_fund_mobile\supabase\functions\send-push-notification\index.ts`
5. 위 파일 안의 내용을 전부 복사해서 에디터 안의 기본 코드를 덮어씌워 줍니다.
6. 우측 하단의 **Deploy(배포)** 버튼을 누르면 모든 백엔드 설정이 완료됩니다!

> **참고**: 배포가 완료된 후 다시 알려주시면, 알림 전송을 자동화하는 DB Webhook/Trigger 설정과 앱 내부의 알림 UI 작업을 즉시 진행하겠습니다.
