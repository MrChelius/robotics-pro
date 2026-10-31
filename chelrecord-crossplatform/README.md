# ChelRecord 1.9.0-beta.1 cross-platform preview

This is a **new prototype**, NOT an edited or verified build of the uploaded ChelRecord-1.8.8-Source.zip. That attachment could not be read in this runtime. It has not been tested against real macOS/iPhone or Windows camera hardware.

## Features implemented in this prototype
- Select a desktop/window source; preview via Electron capture.
- Record entire source or select a proportional crop region in the preview.
- Select available microphone and camera devices (camera composited as picture-in-picture).
- Record to temporary WebM, then transcode to H.264/AAC MP4 using ffmpeg-static.
- Native save dialog; show exported file.
- No cloud uploads, external recording servers or hidden telemetry.

## Not implemented / known limitations
- No direct native iPhone USB capture. Camera appears only if exposed to the operating system as a normal webcam. macOS Continuity Camera is platform dependent.
- Desktop system audio capture is disabled. Only the chosen microphone is recorded.
- Preview region selection crops and stretches to full output canvas resolution; this is not a native pixel crop.
- No audio mixing of system sound with microphone.
- UI and Electron capture were not exercised with physical devices. Installer signatures/notarization are absent.
- FFmpeg package might need binary path adjustment in packaged apps; test on target hardware.
- Recording to WebM then MP4 requires temporary disk space. Large long-duration recordings need more efficient streaming architecture.
- Device permissions on macOS and Windows must be granted. If source picker does not capture, check Electron/OS compatibility.

## Build
```sh
cd chelrecord-crossplatform
npm install
npm run check
npm start
npm run dist:mac   # macOS runner
npm run dist:win   # Windows runner
```
GitHub Actions workflow packages macOS/Windows installers from this branch.

## Test checklist (required before release)
1. Start, stop and discard screen recording.
2. Record primary and secondary displays; record a single window.
3. Drag region and verify captured content in final MP4.
4. Record built-in microphone, USB microphone, and without microphone.
5. Preview internal/external camera, try iPhone Continuity Camera on macOS.
6. Check playback and audio/video synchronization in QuickTime, VLC and CapCut.
7. Force permission rejection, unplug camera mid-recording, test long recording.
8. Validate clean macOS install and Windows SmartScreen behavior.
