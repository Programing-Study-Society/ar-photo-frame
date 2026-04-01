# Project Guidelines

## Code Style
- Use TypeScript with strict typing and existing global interfaces in `src/types/global.d.ts`.
- Follow existing import alias conventions (`@/` for `src`) used throughout `src/pages` and `src/components`.
- Keep UI styling in CSS Modules under `src/styles/` and import module files per component.
- Reuse utility functions from `src/utils/` and hooks from `src/hooks/` instead of duplicating image/canvas logic.

## Architecture
- App is a Next.js Pages Router project with static generation.
- Route flow:
- `src/pages/index.tsx`: hidden template selector page (requires `?debug=true`).
- `src/pages/[id].tsx`: selects `PngFrame`, `GifFrame`, or `FaceFrame` by `imagesData.type`.
- `src/pages/saveGIF.tsx` and `src/pages/savePNG.tsx`: save/export routes.
- `src/data/images.ts` is the source of truth for frame metadata and route IDs.
- Shared capture/composition state lives in `ArPhotoFrameContext` (`src/contexts/ArPhotoFrameContext.tsx`).

## Build and Test
- Install: `npm install`
- Dev (HTTPS): `npm run dev`
- Dev (direct Next): `npm run dev:next`
- Lint: `npm run lint`
- Build: `npm run build`
- Start prod server: `npm run start`
- E2E tests are organized under `tests/e2e/`, but no Playwright config is currently present in the repo.

## Conventions
- Keep local development on HTTPS. Camera access depends on secure context; `npm run dev` already starts Next with `--experimental-https` via `scripts/dev.cjs`.
- In `src/pages/index.tsx`, the landing page intentionally returns 404 unless URL includes `?debug=true`.
- Update `src/data/images.ts` to add/remove frame templates. `enabled: true` controls visibility on the landing page.
- In camera/capture code, preserve WYSIWYG behavior from `useWebcam` (`src/hooks/useWebcam.ts`): crop by preview aspect ratio first, then fallback to target ratio.
- Keep frame-type branching centralized in `src/pages/[id].tsx` (`png`, `gif`, `face`) and align any new logic with this model.

## Pitfalls
- Webcam readiness is gated by `isCameraReady`; camera element is hidden until `onUserMedia` fires (`src/components/ui/Camera.tsx`).
- Face detection and GIF processing are compute-heavy; avoid blocking the UI thread with unnecessary synchronous loops.
- If you modify route IDs, ensure `getStaticPaths`/`getStaticProps` in `src/pages/[id].tsx` and `imagesData` stay consistent.
