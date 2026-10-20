# Deployment notes

Frontend service:
- Runtime: Bun / Hono
- Current production hostname: frontend-production-802b.up.railway.app
- Required dependencies: Hono
- External services: Room API, STT, Translation, LiveKit

Room API:
- Runtime: Bun / Hono
- Dependencies: hono, ioredis, livekit-server-sdk
- Required environment variables: REDIS_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, APP_URL

Translation service:
- Current backend: LibreTranslate
- Languages restricted to EN/RU/ZH/JA/KO/DE/FR/IT to reduce memory pressure.
- Healthcheck: /languages

STT service:
- Current backend: faster-whisper-server CPU
- Production tuning uses a lightweight multilingual model to reduce 502/OOM risk.

Important:
The live Railway frontend still requires the owner to apply its staged frontend change through Railway dashboard two-factor verification. This package contains the final 2.9.0 source, but the ZIP itself does not bypass Railway 2FA.

Before a commercial launch, perform a real-device call test:
1. Mac/Chrome or native macOS app as host.
2. iPhone/Android or a second browser as participant/camera.
3. Test captions and translation for the required language pairs.
4. Verify microphone, camera, screen share, reconnect and phone pairing.
