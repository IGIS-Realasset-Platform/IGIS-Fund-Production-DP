# 웹 플랫폼 알림 연동 가이드

이 문서는 모바일 앱용으로 만든 Supabase 알림 구조를 웹 플랫폼에서도 함께 사용하는 방법을 정리한 것입니다.

## 결론

웹 플랫폼도 `public.iota_notifications` 테이블을 공통 알림 원장으로 사용하면 됩니다.

전체 흐름은 아래와 같습니다.

```text
웹 플랫폼에서 협업 글, 댓글, task 등록
-> Supabase DB trigger가 public.iota_notifications에 알림 row 생성
-> iota_notifications INSERT webhook이 Edge Function 호출
-> Edge Function이 Firebase FCM으로 모바일 푸시 발송
-> 모바일 앱과 웹 플랫폼이 모두 public.iota_notifications를 조회
```

Firebase는 모바일 푸시를 보내기 위한 전달 채널입니다. 알림 데이터의 기준점은 `public.iota_notifications`로 두는 것이 맞습니다.

## 이미 만들어진 백엔드 구성

모바일 브랜치에는 아래 파일들이 있습니다.

- `supabase/migrations/00_create_notifications.sql`
  - `public.fcm_tokens` 생성
  - `public.iota_notifications` 생성
  - 사용자가 자기 알림만 조회하고 읽음 처리할 수 있는 RLS 정책 생성
- `supabase/migrations/01_create_notification_events.sql`
  - DB trigger 함수 생성
  - 협업 글, 댓글, task 생성 시 `iota_notifications`에 알림 row 생성
- `supabase/functions/send-push-notification/index.ts`
  - `iota_notifications` INSERT webhook 수신
  - `fcm_tokens`에서 모바일 기기 토큰 조회
  - Firebase Cloud Messaging 푸시 발송

웹 플랫폼은 Firebase를 직접 호출할 필요가 없습니다.

## ID 매칭 기준

스크린샷 기준 DB 관계는 올바르게 잡혀 있습니다.

```text
public.iota_notifications.user_id -> auth.users.id
public.fcm_tokens.user_id         -> auth.users.id
```

따라서 웹 플랫폼에서는 현재 로그인한 Supabase Auth 사용자의 `user.id`를 기준으로 `iota_notifications.user_id`를 조회하면 됩니다.

```js
const { data } = await supabase.auth.getUser();
const userId = data.user.id;
```

현재 알림 생성 SQL은 수신자 이메일을 `auth.users.email`과 매칭해서 `auth.users.id`를 `iota_notifications.user_id`에 넣는 구조입니다.

```sql
lower(auth.users.email) = lower(iota_seoul_pilot_members.email)
```

그래서 아래 조건이 맞아야 웹/앱 알림이 정상 동작합니다.

1. 웹 사용자가 같은 Supabase Auth 프로젝트로 로그인한다.
2. 로그인 이메일이 `public.iota_seoul_pilot_members.email`과 일치한다.
3. `public.iota_notifications.user_id`에는 해당 사용자의 `auth.users.id`가 들어간다.

## SQL Editor에서 확인할 것

아래 쿼리는 Supabase SQL Editor에서 실행해야 합니다. 브라우저 클라이언트의 anon/publishable key로는 `auth.users`를 직접 조회할 수 없습니다.

### 1. pilot member 중 Auth 계정이 없는 사용자 확인

```sql
select
  m.email,
  m.staff_name,
  m.org_name,
  m.role_code,
  m.workspace_code
from public.iota_seoul_pilot_members m
left join auth.users u
  on lower(u.email) = lower(m.email)
where m.email is not null
  and u.id is null
order by m.email;
```

기대 결과:

```text
0 rows
```

또는 아직 Supabase Auth 계정을 만들지 않은 사용자만 나와야 합니다.

### 2. pilot member와 Auth id 매칭 확인

```sql
select
  m.email,
  m.staff_name,
  u.id as auth_user_id,
  u.email as auth_email,
  u.created_at as auth_created_at
from public.iota_seoul_pilot_members m
join auth.users u
  on lower(u.email) = lower(m.email)
order by m.email;
```

기대 결과:

```text
활성 사용자마다 auth_user_id가 하나씩 매칭되어야 합니다.
```

### 3. 알림 row 중 Auth 사용자와 매칭되지 않는 row 확인

```sql
select
  n.id,
  n.user_id,
  n.title,
  n.type,
  n.created_at
from public.iota_notifications n
left join auth.users u
  on u.id = n.user_id
where u.id is null
order by n.created_at desc;
```

기대 결과:

```text
0 rows
```

### 4. 알림 row와 사용자 이메일 매칭 확인

```sql
select
  n.id,
  n.user_id,
  u.email,
  n.title,
  n.type,
  n.is_read,
  n.created_at
from public.iota_notifications n
join auth.users u
  on u.id = n.user_id
order by n.created_at desc
limit 50;
```

이 쿼리로 알림이 의도한 사용자에게 들어가고 있는지 확인합니다.

### 5. 모바일 FCM 토큰과 사용자 매칭 확인

```sql
select
  t.user_id,
  u.email,
  count(*) as token_count,
  max(t.updated_at) as latest_token_at
from public.fcm_tokens t
left join auth.users u
  on u.id = t.user_id
group by t.user_id, u.email
order by latest_token_at desc;
```

기대 결과:

```text
모바일 앱에 로그인하고 푸시 권한을 허용한 사용자가 표시됩니다.
```

## 웹 조회를 위한 RLS 정책

아래 정책이 이미 적용되어 있으면 다시 만들 필요는 없습니다. 누락되어 있으면 SQL Editor에서 적용합니다.

```sql
alter table public.iota_notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.iota_notifications;
create policy "Users can view their own notifications"
on public.iota_notifications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.iota_notifications;
create policy "Users can update their own notifications"
on public.iota_notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

웹에서 실시간 알림을 받으려면 Realtime publication에 테이블을 추가합니다.

```sql
alter publication supabase_realtime add table public.iota_notifications;
```

이미 등록되어 있다는 에러가 나오면 무시해도 됩니다.

## 웹 클라이언트 구현

웹 클라이언트에는 Supabase publishable/anon key만 사용합니다. service role key는 절대 브라우저에 넣으면 안 됩니다.

### 알림 목록 조회

```js
export async function fetchNotifications(supabase, limit = 50) {
  const { data, error } = await supabase
    .from('iota_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
```

RLS가 적용되어 있으면 현재 로그인 사용자의 알림만 내려옵니다.

### 안 읽은 알림 수 조회

```js
export async function fetchUnreadNotificationCount(supabase) {
  const { count, error } = await supabase
    .from('iota_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) throw error;
  return count ?? 0;
}
```

### 알림 읽음 처리

```js
export async function markNotificationAsRead(supabase, notificationId) {
  const { error } = await supabase
    .from('iota_notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}
```

### 새 알림 실시간 구독

```js
export async function subscribeToNotifications(supabase, onInsert) {
  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const user = userResult?.user;
  if (!user) return null;

  const channel = supabase
    .channel(`iota-notifications-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'iota_notifications',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        onInsert(payload.new);
      }
    )
    .subscribe();

  return channel;
}
```

컴포넌트 unmount 시 구독을 해제합니다.

```js
if (channel) {
  supabase.removeChannel(channel);
}
```

## 웹 UI 권장 구성

웹 플랫폼의 로그인 이후 공통 shell 영역에 알림 버튼을 추가합니다.

최소 구성:

- 상단 또는 좌측 네비게이션의 알림 아이콘
- 안 읽은 알림 수 badge
- 알림 목록 드롭다운 또는 사이드 패널
- 최신 50개 알림 표시
- 알림 클릭 시 `is_read = true` 업데이트
- Realtime INSERT 수신 시 toast 또는 badge count 갱신

표시 필드:

- `title`
- `body`
- `type`
- `created_at`
- `is_read`

## 알림 클릭 후 화면 이동

현재 알림 테이블에는 `reference_id`가 있습니다. 다만 실제 웹 화면 이동까지 하려면 알림이 어느 테이블/워크스페이스/라우트에 연결되는지 정보가 더 필요할 수 있습니다.

향후 확장 추천 필드:

- `reference_table`
- `workspace_code`
- `workspace_label`
- `route_path`

이 필드가 있으면 알림 클릭 시 관련 워크스페이스, 로그, 댓글, task 화면으로 이동시킬 수 있습니다.

## 웹팀에게 전달할 핵심

웹 플랫폼은 별도 알림 테이블을 만들 필요가 없습니다.

아래 구조로 기존 `public.iota_notifications`를 그대로 사용하면 됩니다.

```text
알림 목록: public.iota_notifications 조회
안 읽은 수: public.iota_notifications where is_read = false
실시간 수신: 현재 auth user id로 필터링한 INSERT realtime 구독
알림 생성 원천: 기존 협업 글, 댓글, task 테이블의 DB trigger
모바일 푸시: 기존 Supabase Edge Function + Firebase가 처리
```

우선 작업 순서는 다음을 추천합니다.

1. SQL Editor에서 이메일과 `auth.users.id` 매칭을 확인합니다.
2. `iota_notifications` RLS 정책을 확인합니다.
3. 웹 공통 shell에 알림 아이콘과 unread badge를 붙입니다.
4. 알림 목록 조회와 읽음 처리를 붙입니다.
5. 필요하면 Realtime 구독으로 toast와 badge 자동 갱신을 붙입니다.
