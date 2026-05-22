# 웹 플랫폼 알림 연동 설명

## 작동 원리

알림의 기준 테이블은 `public.iota_notifications`입니다.

현재 구조는 아래 흐름입니다.

```text
웹/앱에서 협업 글, 댓글, task 등록
-> Supabase DB trigger가 public.iota_notifications에 알림 row 생성
-> iota_notifications에 새 row가 insert되면 Supabase webhook이 Edge Function 호출
-> Edge Function이 fcm_tokens에서 해당 사용자의 모바일 토큰 조회
-> Firebase FCM으로 모바일 푸시 발송
```

즉, 웹 플랫폼이 Firebase를 직접 호출할 필요는 없습니다.

웹 플랫폼이 기존 업무 테이블에 글, 댓글, task를 정상 저장하면 DB trigger가 알림 row를 만들고, 그 row를 기준으로 모바일 푸시가 발송됩니다.

## ID 연결 기준

`iota_notifications.user_id`는 Supabase Auth의 사용자 id입니다.

```text
iota_notifications.user_id -> auth.users.id
fcm_tokens.user_id         -> auth.users.id
```

웹 플랫폼에서도 Supabase Auth 로그인 사용자의 `user.id`를 기준으로 알림을 조회하면 됩니다.

```js
const { data } = await supabase.auth.getUser();
const userId = data.user.id;
```

## 웹 플랫폼에서 작업할 것

1. 현재 로그인 사용자의 `user.id`를 가져옵니다.

2. `public.iota_notifications`에서 `user_id = 현재 user.id`인 알림을 조회합니다.

```js
const { data, error } = await supabase
  .from('iota_notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);
```

3. 안 읽은 알림 수가 필요하면 `is_read = false` 조건으로 count합니다.

```js
const { count, error } = await supabase
  .from('iota_notifications')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false);
```

4. 사용자가 알림을 확인하면 `is_read = true`로 업데이트합니다.

```js
await supabase
  .from('iota_notifications')
  .update({ is_read: true })
  .eq('id', notificationId)
  .eq('user_id', userId);
```

5. 웹에서 실시간 알림 반영이 필요하면 `iota_notifications` INSERT를 구독합니다.

```js
const channel = supabase
  .channel(`iota-notifications-${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'iota_notifications',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      // 새 알림 row: payload.new
      // 웹 플랫폼 구조에 맞게 목록 갱신, 배지 갱신, toast 표시 등 처리
    }
  )
  .subscribe();
```

## 웹에서 알림이 가게 되는 조건

웹 플랫폼에서 아래 테이블에 데이터를 저장하면 DB trigger가 알림 row를 생성합니다.

- `iota_seoul_logs` 새 글 등록
- `iota_seoul_logs.metadata`에 댓글 추가
- `iota_pm_tasks` 새 task 등록
- `iota_financing_tasks` 새 task 등록
- `iota_development_tasks` 새 task 등록
- `iota_marketing_tasks` 새 task 등록
- `iota_digital_tasks` 새 task 등록
- `iota_fund_tasks` 새 task 등록
- `iota_ipr_tasks` 새 task 등록

웹 플랫폼은 위 테이블에 기존 방식대로 저장하면 됩니다. 별도로 Firebase 호출이나 `iota_notifications` 직접 insert는 하지 않아도 됩니다.

## 확인할 것

- 웹 플랫폼 로그인 사용자가 Supabase Auth 사용자여야 합니다.
- `iota_notifications.user_id`와 웹 로그인 사용자의 `user.id`가 같아야 합니다.
- 모바일 푸시를 받으려면 해당 사용자가 모바일 앱에서 로그인했고 `fcm_tokens`에 토큰이 저장되어 있어야 합니다.
- 웹 화면에서 알림을 보여주려면 웹이 `iota_notifications`를 조회하면 됩니다.
