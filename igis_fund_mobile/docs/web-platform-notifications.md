# 웹 플랫폼 알림 연동 작업 요청

웹 플랫폼에서 기존 `public.iota_notifications` 테이블을 읽어서 알림 기능을 붙여주세요.

## 해야 할 일

1. 로그인 사용자 id 확인

```js
const { data } = await supabase.auth.getUser();
const userId = data.user.id;
```

이 `userId`는 `public.iota_notifications.user_id`와 매칭됩니다.

2. 알림 목록 조회 함수 추가

```js
const { data, error } = await supabase
  .from('iota_notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);
```

3. 안 읽은 알림 수 조회

```js
const { count, error } = await supabase
  .from('iota_notifications')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false);
```

4. 알림 읽음 처리

```js
await supabase
  .from('iota_notifications')
  .update({ is_read: true })
  .eq('id', notificationId)
  .eq('user_id', userId);
```

5. 실시간 알림 구독

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
      // 새 알림 toast 표시 또는 알림 목록/배지 갱신
      console.log(payload.new);
    }
  )
  .subscribe();
```

컴포넌트 해제 시:

```js
supabase.removeChannel(channel);
```

6. UI 추가

- 상단 또는 좌측 네비게이션에 알림 아이콘 추가
- 안 읽은 알림 수 badge 표시
- 클릭 시 알림 목록 드롭다운 또는 패널 표시
- 알림 클릭 시 읽음 처리
- 새 알림 수신 시 badge 갱신 또는 toast 표시

## 표시할 필드

- `title`
- `body`
- `type`
- `created_at`
- `is_read`

## 참고

알림 생성은 이미 DB trigger가 처리합니다.

웹에서 새 알림을 직접 만들 필요는 없습니다. 웹은 `iota_notifications`를 조회하고 읽음 처리만 하면 됩니다.
