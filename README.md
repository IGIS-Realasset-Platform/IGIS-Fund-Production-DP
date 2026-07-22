# IGIS Fund Production DP

## iOS 실행 모드

- 빠른 기본 실행: `npm run ios:sync` 후 Xcode에서 실행합니다. 빌드된 `dist`가 앱에 포함됩니다.
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
