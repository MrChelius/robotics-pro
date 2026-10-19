# LinguaSpire 2.8 Desktop

Native desktop shell for the LinguaSpire production service.

This build:
- opens LinguaSpire inside its own Electron window, not in Safari/Chrome
- requests native macOS camera and microphone permission
- supports the production meeting UI, translated chat and captions
- supports screen capture through Electron
- uses the production LinguaSpire backend

The GitHub Actions workflow builds an ARM64 macOS DMG for Apple Silicon Macs.
