# Web Platform Notification Integration

This note explains how the web platform should use the existing Supabase notification pipeline that was added for the mobile app.

## Summary

Use `public.iota_notifications` as the shared notification source of truth.

The intended flow is:

```text
Web platform writes a collaboration log, comment, or workspace task
-> Supabase DB trigger inserts rows into public.iota_notifications
-> Mobile push webhook sends Firebase push from those rows
-> Mobile app and web platform both read public.iota_notifications
```

Firebase is only the mobile push delivery channel. The canonical notification record should remain `public.iota_notifications`.

## Existing Backend Pieces

The mobile branch contains these backend assets:

- `supabase/migrations/00_create_notifications.sql`
  - Creates `public.fcm_tokens`
  - Creates `public.iota_notifications`
  - Adds RLS policies for users to view and update their own notifications
- `supabase/migrations/01_create_notification_events.sql`
  - Creates DB trigger functions
  - Inserts notification rows when collaboration logs, comments, or task rows are created
- `supabase/functions/send-push-notification/index.ts`
  - Receives webhook events from `public.iota_notifications`
  - Looks up `public.fcm_tokens`
  - Sends Firebase Cloud Messaging push notifications

The web platform does not need to call Firebase directly.

## Important ID Matching Rule

`public.iota_notifications.user_id` must match `auth.users.id`.

The current SQL trigger creates notifications by matching recipient emails to Supabase Auth users:

```sql
lower(auth.users.email) = lower(iota_seoul_pilot_members.email)
```

So the web platform will work correctly if:

1. Web users log in through the same Supabase Auth project.
2. Their login email matches the email stored in `public.iota_seoul_pilot_members`.
3. `public.iota_notifications.user_id` stores the matching `auth.users.id`.

## SQL Editor Checks

Run these in Supabase SQL Editor. These queries need SQL Editor access because client anon/publishable keys cannot read `auth.users` directly.

### 1. Check pilot members without matching Auth users

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

Expected result: zero rows, or only people who have not created/logged into accounts yet.

### 2. Check Auth IDs matched to pilot members

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

Expected result: each active pilot member has exactly one `auth_user_id`.

### 3. Check notification rows with no matching Auth user

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

Expected result: zero rows.

### 4. Check notification rows joined to users

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

Use this to confirm that notification ownership is landing on the expected users.

### 5. Check FCM tokens joined to users

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

Expected result: mobile users who logged in and granted notification permission should appear here.

## Required SQL For Web Reading

If not already applied, make sure RLS allows logged-in users to read and update only their own notifications.

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

For realtime notifications, add the table to the realtime publication:

```sql
alter publication supabase_realtime add table public.iota_notifications;
```

If Supabase says the table is already in the publication, no action is needed.

## Web Client Implementation

Use the Supabase publishable/anon key in the web client. Do not put service role keys in the browser.

### Fetch notifications

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

RLS should restrict results to the logged-in user's own rows.

### Fetch unread count

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

### Mark one notification as read

```js
export async function markNotificationAsRead(supabase, notificationId) {
  const { error } = await supabase
    .from('iota_notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}
```

### Subscribe to new notifications

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

Clean up the subscription when the component unmounts:

```js
if (channel) {
  supabase.removeChannel(channel);
}
```

## Suggested Web UI

Add a notification bell to the authenticated platform shell.

Minimum UI:

- Bell icon in the top bar or left nav
- Unread badge count
- Notification dropdown or side panel
- Latest 50 notifications
- Click notification -> mark `is_read = true`
- Optional toast when realtime INSERT arrives

Suggested display fields:

- `title`
- `body`
- `type`
- `created_at`
- `is_read`

## Click-Through Navigation

The current notification trigger can create rows without a detailed reference target. If the web team wants notification click-through navigation, extend notification payloads to include a useful target.

Current table has:

- `reference_id`

Recommended future fields:

- `reference_table`
- `workspace_code`
- `workspace_label`
- `route_path`

Then the web app can route from notification click to the relevant workspace, log, comment, or task.

## What To Tell The Web Team

The web platform does not need a separate notification table.

It should reuse `public.iota_notifications`:

```text
Read: public.iota_notifications
Unread count: public.iota_notifications where is_read = false
Realtime: INSERT events on public.iota_notifications filtered by current auth user id
Write trigger source: existing collaboration log, comment, and task tables
Mobile push: handled by existing Supabase Edge Function + Firebase
```

The first integration task is to verify email-to-auth-id matching in SQL Editor, then add a notification bell UI backed by `iota_notifications`.
