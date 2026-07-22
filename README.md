# IGIS Fund Production DP

## iOS 실행 모드

- 빠른 기본 실행: `npm run ios:ready`를 사용합니다. 웹 번들 동기화, iPhone 연결 점검, Xcode 열기를 순서대로 수행합니다.
- Xcode가 빌드 완료 후 멈추면 `npm run ios:doctor`로 기기 터널을 확인합니다. 실패 시 iPhone 잠금/네트워크/USB 연결을 확인하고, Xcode 종료 후 `pkill -x CoreDeviceService`를 실행한 다음 다시 시도합니다.
- Live Reload: `npm run dev:staging`으로 8082 서버를 실행한 뒤 `npm run ios:live:sync`를 실행합니다.
- 파일 변경 감지가 불안정한 경우에만 `npm run dev:staging:poll`을 사용합니다.

Live Reload URL은 안전을 위해 8082 포트만 허용합니다. Live Reload 테스트 후 기본 실행으로 돌아갈 때는 `npm run ios:sync`를 다시 실행합니다.

## Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
