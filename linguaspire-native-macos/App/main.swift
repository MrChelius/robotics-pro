import Cocoa
import WebKit

private let appName = "LinguaSpire"
private let appVersion = "2.8.0"
private let productionURL = URL(string: "https://frontend-production-802b.up.railway.app/")!
private let allowedHost = "frontend-production-802b.up.railway.app"

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate {
    private var window: NSWindow!
    private var webView: WKWebView!
    private var loadedProductionOnce = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        buildMenu()
        createWindow()
        requestNativePermissions()
        loadProduction()
        checkForUpdates(silent: true)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return false
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if !flag {
            window.makeKeyAndOrderFront(nil)
        }
        return true
    }

    private func createWindow() {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsMagnification = true
        webView.customUserAgent = "LinguaSpire/\(appVersion) macOS WKWebView"

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1440, height: 900),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        window.title = appName
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        window.minSize = NSSize(width: 980, height: 680)
        window.center()
        window.backgroundColor = NSColor(calibratedRed: 0.03, green: 0.075, blue: 0.145, alpha: 1)
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)
    }

    private func buildMenu() {
        let mainMenu = NSMenu()

        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenuItem.submenu = appMenu
        appMenu.addItem(withTitle: "About \(appName)", action: #selector(showAbout), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Check for Updates…", action: #selector(checkUpdatesMenu), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Hide \(appName)", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(withTitle: "Hide Others", action: #selector(NSApplication.hideOtherApplications(_:)), keyEquivalent: "h").keyEquivalentModifierMask = [.command, .option]
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit \(appName)", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        let editItem = NSMenuItem()
        mainMenu.addItem(editItem)
        let editMenu = NSMenu(title: "Edit")
        editItem.submenu = editMenu
        editMenu.addItem(withTitle: "Undo", action: Selector(("undo:")), keyEquivalent: "z")
        editMenu.addItem(withTitle: "Redo", action: Selector(("redo:")), keyEquivalent: "Z")
        editMenu.addItem(NSMenuItem.separator())
        editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")

        let viewItem = NSMenuItem()
        mainMenu.addItem(viewItem)
        let viewMenu = NSMenu(title: "View")
        viewItem.submenu = viewMenu
        viewMenu.addItem(withTitle: "Reload", action: #selector(reloadPage), keyEquivalent: "r")
        viewMenu.addItem(withTitle: "Home", action: #selector(goHome), keyEquivalent: "0")
        viewMenu.addItem(NSMenuItem.separator())
        viewMenu.addItem(withTitle: "Enter Full Screen", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f").keyEquivalentModifierMask = [.command, .control]

        let windowItem = NSMenuItem()
        mainMenu.addItem(windowItem)
        let windowMenu = NSMenu(title: "Window")
        windowItem.submenu = windowMenu
        windowMenu.addItem(withTitle: "Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        windowMenu.addItem(withTitle: "Zoom", action: #selector(NSWindow.performZoom(_:)), keyEquivalent: "")

        NSApp.mainMenu = mainMenu
    }

    private func requestNativePermissions() {
        AVCaptureDevice.requestAccess(for: .audio) { _ in }
        AVCaptureDevice.requestAccess(for: .video) { _ in }
    }

    private func isAllowed(_ url: URL?) -> Bool {
        guard let url else { return false }
        return url.scheme == "https" && url.host == allowedHost
    }

    private func loadProduction() {
        var request = URLRequest(url: productionURL)
        request.cachePolicy = .reloadRevalidatingCacheData
        request.timeoutInterval = 30
        webView.load(request)
    }

    private func loadOfflinePage(error: Error?) {
        let message = (error as NSError?)?.localizedDescription ?? "The LinguaSpire service could not be reached."
        let escaped = message
            .replacingOccurrences(of: "&", with: "&amp;")
            .replacingOccurrences(of: "<", with: "&lt;")
            .replacingOccurrences(of: ">", with: "&gt;")
            .replacingOccurrences(of: """, with: "&quot;")
        let html = """
        <!doctype html><html><head><meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
        body{margin:0;background:#071325;color:#f5f8ff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:grid;place-items:center;min-height:100vh}
        main{max-width:680px;text-align:center;padding:48px}.logo{width:78px;height:78px;margin:0 auto 24px;border-radius:22px;background:linear-gradient(135deg,#35b9ff,#6d5cff);display:grid;place-items:center;font-size:40px;font-weight:900}
        h1{font-size:38px;margin:0 0 12px}.muted{color:#a6b4ca;line-height:1.65}.error{color:#7287a6;font-size:13px}
        button{margin-top:18px;border:0;border-radius:12px;background:#4b7cff;color:white;font-weight:800;padding:13px 22px;font-size:15px}
        </style></head><body><main><div class="logo">L</div><h1>LinguaSpire</h1><p class="muted">No connection to the LinguaSpire service. Check your internet connection and try again.</p><p class="error">(escaped)</p><button onclick="window.location.href='https://frontend-production-802b.up.railway.app/'">Try again</button></main></body></html>
        """
        webView.loadHTMLString(html, baseURL: nil)
    }

    @objc private func reloadPage() {
        if isAllowed(webView.url) {
            webView.reload()
        } else {
            loadProduction()
        }
    }

    @objc private func goHome() {
        loadProduction()
    }

    @objc private func showAbout() {
        NSApp.orderFrontStandardAboutPanel(options: [
            .applicationName: appName,
            .applicationVersion: appVersion,
            .version: "2.8.0",
            .copyright: "© 2026 LinguaSpire. All rights reserved."
        ])
    }

    @objc private func checkUpdatesMenu() {
        checkForUpdates(silent: false)
    }

    private func checkForUpdates(silent: Bool) {
        let url = productionURL.appendingPathComponent("api/version")
        URLSession.shared.dataTask(with: url) { data, _, _ in
            guard let data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let latest = json["version"] as? String else {
                if !silent {
                    DispatchQueue.main.async {
                        let alert = NSAlert()
                        alert.messageText = "Unable to check for updates"
                        alert.informativeText = "LinguaSpire could not reach the version service."
                        alert.runModal()
                    }
                }
                return
            }
            if latest != appVersion || !silent {
                DispatchQueue.main.async {
                    let alert = NSAlert()
                    if latest == appVersion {
                        alert.messageText = "LinguaSpire is up to date"
                        alert.informativeText = "You are using version \(appVersion)."
                    } else {
                        alert.messageText = "A LinguaSpire update is available"
                        alert.informativeText = "Installed: \(appVersion)\nAvailable: \(latest)"
                        alert.addButton(withTitle: "View Release Notes")
                        alert.addButton(withTitle: "Later")
                        if alert.runModal() == .alertFirstButtonReturn {
                            NSWorkspace.shared.open(productionURL.appendingPathComponent("release-notes"))
                        }
                        return
                    }
                    alert.runModal()
                }
            }
        }.resume()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loadedProductionOnce = isAllowed(webView.url)
        let js = """
        document.documentElement.setAttribute('data-native-shell','macos');
        window.dispatchEvent(new CustomEvent('linguaspire-native-ready',{detail:{platform:'macOS',version:'2.8.0'}}));
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        if !loadedProductionOnce { loadOfflinePage(error: error) }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        if !loadedProductionOnce { loadOfflinePage(error: error) }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        if isAllowed(url) || url.scheme == "about" || url.scheme == "data" || url.scheme == "blob" {
            decisionHandler(.allow)
        } else if url.scheme == "https" || url.scheme == "http" || url.scheme == "mailto" {
            NSWorkspace.shared.open(url)
            decisionHandler(.cancel)
        } else {
            decisionHandler(.cancel)
        }
    }

    @available(macOS 12.0, *)
    func webView(_ webView: WKWebView,
                 requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                 initiatedByFrame frame: WKFrameInfo,
                 type: WKMediaCaptureType,
                 decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        if origin.host == allowedHost {
            decisionHandler(.grant)
        } else {
            decisionHandler(.deny)
        }
    }
}

let application = NSApplication.shared
let delegate = AppDelegate()
application.delegate = delegate
application.run()
