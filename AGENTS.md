# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React + TypeScript app for an interactive GPS/GNSS lesson. Source code lives in `src/`. The main shell is `src/app/App.tsx`; feature code is under `src/features/`; shared state is in `src/store/gpsStore.ts`; demo data is in `src/data/`; and utilities are in `src/utils/`.

Use `src/features/gps-calculation/` for math; `src/features/scene3d/` for React Three Fiber components; `src/features/lesson/` for lesson flow; and `src/features/calculator-panel/` for value displays. Tests are in `src/__tests__/`. Public assets are in `public/`; imported app assets are in `src/assets/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server.
- `npm run build`: run TypeScript project checks, then build production assets into `dist/`.
- `npm run preview`: serve the production build locally.
- `npm test`: run the Vitest suite once.
- `npm run test:watch`: run Vitest in watch mode.
- `npm run test:coverage`: generate a V8 coverage report.
- `npm run lint`: run ESLint across the repository.

## Coding Style & Naming Conventions

Use TypeScript for logic and `.tsx` for React components. Follow the existing style: two-space indentation, semicolons, named exports for utilities, and PascalCase component filenames. Use camelCase for functions, variables, and store fields. Keep calculation helpers pure where practical.

ESLint is configured in `eslint.config.js` with recommended JavaScript, TypeScript, React Hooks, and React Refresh rules. Run `npm run lint` before opening a pull request.

## Testing Guidelines

Vitest is the test framework. Place unit tests in `src/__tests__/` using `*.test.ts` naming, as in `leastSquares.test.ts` and `pseudorange.test.ts`. Prefer deterministic tests for math functions: assert convergence tolerances, matrix shape, unit conversions, and edge cases such as clock bias or noisy pseudoranges.

Run `npm test` for normal verification and `npm run test:coverage` when changing core calculations.

## Commit & Pull Request Guidelines

The current history uses Conventional Commits style, for example `feat: GPS 定位原理互動教案初始版本`. Continue using short, imperative prefixes such as `feat:`, `fix:`, `test:`, `docs:`, or `refactor:`.

Pull requests should include a brief summary, test results such as `npm test` and `npm run lint`, and screenshots or screen recordings for visible UI or 3D scene changes. Link related issues when applicable. For math changes, describe the expected numerical behavior and any tolerance adjustments.

## Security & Configuration Tips

Do not commit generated `dist/` output unless explicitly requested. Keep dependency updates intentional and verify lockfile changes. Avoid hard-coding secrets or environment-specific URLs.
