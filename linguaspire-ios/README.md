# LinguaSpire iOS 2.9.3 — Xcode build project

This folder is the source project for an **iOS wrapper of the deployed LinguaSpire web app**. It is **not** a signed IPA or App Store-approved binary. Calls, captions and chat depend on the online Railway/LiveKit services. A WebKit wrapper does not fix server-side recognition accuracy or LiveKit disconnects.

## Build on macOS

1. Install Xcode from Apple and install XcodeGen (for example, `brew install xcodegen`).
2. In Terminal: `cd linguaspire-ios && xcodegen generate`.
3. Open `LinguaSpire.xcodeproj`.
4. Set your own Apple Developer **Team** and a unique **Bundle Identifier** under Signing & Capabilities.
5. Connect an iPhone, select it as destination, press Run. Approve camera/microphone requests to test.
6. To distribute with TestFlight or signed IPA, use Product > Archive > Distribute App with an eligible Apple Developer account. Apple signing/provisioning credentials are never committed to GitHub.

## Testing and distribution prerequisites

- Test a real two-person call on iPhone and Windows, including disconnections, app switching, microphone permissions and captions.
- Verify privacy disclosures and recording/consent notices.
- Create full App Store metadata, 1024×1024 app icon, screenshots and support links.
- A simple WKWebView wrapper may be rejected under App Store minimum-functionality policies; add native iOS value before commercial App Store submission.

**Immediate iPhone option:** open https://frontend-v29-live-production.up.railway.app/ in Safari, then choose Share > Add to Home Screen.
