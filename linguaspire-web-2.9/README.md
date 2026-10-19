# LinguaSpire Web 2.9.0

Production-ready source package for the LinguaSpire multilingual video meeting web app.

Included:
- frontend.ts — Hono frontend/UI, live captions, translated chat, phone camera pairing UI, legal/support routes and diagnostics.
- room-api.ts — Room API with Argon2id passwords, waiting-room authorization, rate limits, one-time phone-camera pairing, LiveKit token issuance.
- qa/test_production.py — production smoke/E2E checks.
- qa/test_resilient_languages.py — 8-language / 56-direction translation and STT QA.
- DEPLOYMENT.md — Railway deployment checklist.

Supported UI/meeting languages:
English, Russian, Chinese, Japanese, Korean, German, French, Italian.

Version: 2.9.0
