# ChelRecord 1.9.1 RC1

Cross-platform screen and webcam recorder for macOS Apple Silicon and Windows x64.

**Important:** This is a new Electron implementation. The older ChelRecord 1.8.8 Source ZIP could not be opened in this environment, so this is not a verified repair of that original code.

## Recording options
- Whole display or individual window, chosen from DesktopCapturer thumbnails.
- Custom screen region: draw a rectangle in the preview, then select Record. Region crop maintains its source aspect ratio with black bars if needed.
- Camera-only recording independent of screen capture.
- Camera picture-in-picture over the selected screen.
- Independent camera preview and microphone volume-meter tests.
- MP4 export using H.264 video and optional AAC microphone audio via bundled FFmpeg.

## Automated verification
- JavaScript syntax checks in GitHub Actions.
- Bundled FFmpeg successfully encodes/decodes a synthetic H.264/AAC MP4 and encodes a silent H.264 MP4 on both macOS and Windows.
- Installer creation on macOS arm64 (DMG) and Windows x64 (NSIS), with macOS ad-hoc signature validation.

**Not verified by automated tests:** camera or microphone hardware on the user's computer; iPhone Continuity Camera; physical screen capture, end-to-end video recording or playback in a real desktop session. Treat this as a release candidate until these tests pass.

## How to use
1. On macOS, open System Settings > Privacy & Security and permit Screen & System Audio Recording, Camera and Microphone to ChelRecord. Fully quit (Cmd+Q) and reopen after changing screen permission.
2. Choose the capture mode: Screen/Window, Region or Camera only.
3. For screen recording choose a source from the thumbnails and press Start preview. Region mode requires drawing a rectangle before Record is enabled.
4. To record a camera, choose the camera and Test camera; it also starts automatically during screen preview if selected.
5. Select a microphone to include sound (Off by default) and optionally press Test microphone.
6. Press Record, select an MP4 destination, then Stop & save MP4. Use Show saved recording to open its location.

## Limitations
- System/desktop audio is not supported; microphone only.
- iPhone support uses Continuity Camera when macOS exposes the iPhone as a normal webcam. Direct native USB capture has not been implemented.
- Windows phone webcams require compatible virtual-camera software.
- Mac installer is ad-hoc signed, **not notarized** with an Apple Developer ID; Gatekeeper may still block or warn.
- Windows installer is not digitally signed and may trigger SmartScreen.
- Large recordings require temporary disk space for WebM-to-MP4 conversion.

## Build

    cd chelrecord-crossplatform
    npm install
    npm run check
    npm run test:media
    npm start
    npm run dist:mac    # on macOS arm64
    npm run dist:win    # on Windows x64

Source branch: feature/chelrecord-crossplatform-preview.
