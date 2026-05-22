# Remaining Work

## Confirmed

- `feature/sjlee` on `this8369/IGIS-Fund-Production-DP` now points to the same commit as `main`.
- Flutter SDK is installed at `C:\Users\crusl\flutter_sdk\flutter`.
- `IOTA Seoul CFT` was created as a Flutter Android/iOS app.
- `flutter analyze` passes for the mobile app.
- Android phone `SM S918N` / `R3CW20243SH` is detected by Flutter.
- `:app:assembleDebug` succeeds and produces `build\app\outputs\flutter-apk\app-debug.apk`.
- The app installs and launches on the phone with `config\supabase.local.json`.
- Supabase initialization completes on device.

## Open Work

1. Replace or confirm the Supabase API key in `config\supabase.local.json`; the current branch-provided key shows `Unregistered API key` on the login screen.
2. Verify login against the real Supabase project after the API key is corrected.
3. Confirm actual workspace mapping and permission rules against the web platform.
4. Validate `iota_seoul_logs` read/write behavior with existing RLS policies.
5. Confirm comment update behavior for `metadata.comments`.
6. Design notification tables for in-app notification history and read state.
7. Add mobile device token registration for push notifications.
8. Integrate Firebase Cloud Messaging and iOS APNs configuration.
9. Add iOS build/signing verification on macOS.

## Current Constraints

- Supabase credentials must stay out of Git.
- Use the Flutter wrapper scripts in `tool\` unless `FLUTTER_HOME` is configured.
- In Codex, Flutter commands that write to `C:\Users\crusl\flutter_sdk\flutter\bin\cache` must run outside the sandbox; otherwise `flutter.bat` can wait indefinitely on cache lock creation.
- Pushes to the team repository should use SSH authentication for `sjleeigisam-RA-IEO`.
