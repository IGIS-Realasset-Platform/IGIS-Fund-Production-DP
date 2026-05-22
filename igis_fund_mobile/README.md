# IOTA Seoul CFT

Flutter mobile client for the IOTA Seoul CFT work platform.

## Purpose

This app is the mobile companion to the existing React/Supabase work platform.
The first scope is focused on mobile access to work status, workspace logs,
external work-log entry, comments, and later push notifications.

## Current Scope

- Supabase Auth login
- Current member lookup from `iota_seoul_pilot_members`
- Recent work-log feed from `iota_seoul_logs`
- User workspace log view and log creation
- Log visibility metadata aligned with platform role, organization, and user scope
- Other workspace log browsing
- Comment creation through `metadata.comments`

## Local Configuration

Do not commit Supabase credentials.

Create a local config file from the example:

```powershell
Copy-Item config\supabase.example.json config\supabase.local.json
```

Fill these keys in `config\supabase.local.json`:

```json
{
  "SUPABASE_URL": "https://your-project.supabase.co",
  "SUPABASE_ANON_KEY": "your-anon-key"
}
```

The local file is ignored by Git.

## Commands

Use the workspace wrapper so the known Flutter SDK is used:

```powershell
.\tool\analyze.ps1
```

Run the app with local Supabase values:

```powershell
.\tool\run-dev.ps1
```

Pass a device id when needed:

```powershell
.\tool\run-dev.ps1 -DeviceId emulator-5554
```

## Flutter SDK

The verified local SDK path is:

```powershell
C:\Users\crusl\flutter_sdk\flutter
```

Set `FLUTTER_HOME` if a different SDK should be used.

## Next Work

- Verify login against the real Supabase project.
- Confirm workspace/permission rules against the web platform.
- Add notification tables and push-token registration.
- Add FCM/APNs push delivery after the notification model is approved.
