# LinguaSpire 2.9 Desktop

Desktop shell for the current LinguaSpire production service.

This build:
- opens LinguaSpire in its own desktop window
- uses the current production meeting service
- supports camera and microphone calls
- supports speech recognition and translated live captions
- supports screen capture through Electron
- keeps external links outside the app
- is packaged for macOS Apple Silicon and Windows x64

Build artifacts:
- macOS Apple Silicon: DMG + app ZIP
- Windows x64: NSIS installer EXE

The app requires an internet connection because meetings, STT and translation use the production backend.
