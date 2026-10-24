# LinguaSpire Desktop 2.9.2

This desktop app runs an isolated local HTTP frontend and proxies strictly scoped API calls to the user's existing Railway services. Audio/video traffic uses LiveKit provided by the production Room API. It is **not an offline video meeting product**; Room API, LiveKit, STT and Translation must remain reachable. The desktop app has not been tested with two real participants in this environment. This build is unnotarized and is not a verified production release.

## Build

Run `npm ci` (or `npm install` initially), `npm run prepack:client`, then `npm run dist:mac` on macOS or `npm run dist:win` on Windows. GitHub Actions workflow produces artifacts on both platforms.

## Security

Binds to 127.0.0.1 only; accepts only meeting `/v1/` and designated `/api/` routes. Does not embed server credentials. Existing room API and translator require internet access. The local HTTP app runs with Electron sandbox and nodeIntegration disabled. Electron application artifacts require platform signing/notarization for trusted distribution.