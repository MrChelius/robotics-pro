// ChelRecord native macOS desktop recorder.
// Captures the actual display through ScreenCaptureKit, not an Electron window picker.
// macOS 15+, compiled into the app bundle by GitHub Actions.
import Foundation
import ScreenCaptureKit
import AVFoundation
import AppKit
import CoreGraphics
import CoreMedia
import Darwin

@available(macOS 15.0, *)
final class DisplayCapture: NSObject, SCRecordingOutputDelegate, SCStreamDelegate {
    private var stream: SCStream?
    private var output: SCRecordingOutput?
    private let didFinish = DispatchSemaphore(value: 0)
    private var recordingFailure: Error?
    private var started = false

    func recordingOutputDidStartRecording(_ recordingOutput: SCRecordingOutput) {
        started = true
        fputs("RECORDING\n", stdout)
        fflush(stdout)
    }
    func recordingOutput(_ recordingOutput: SCRecordingOutput, didFailWithError error: any Error) {
        recordingFailure = error
        fputs("FAILURE \(error.localizedDescription)\n", stderr)
        fflush(stderr)
        didFinish.signal()
    }
    func recordingOutputDidFinishRecording(_ recordingOutput: SCRecordingOutput) {
        didFinish.signal()
    }
    func stream(_ stream: SCStream, didStopWithError error: any Error) {
        recordingFailure = error
        fputs("FAILURE \(error.localizedDescription)\n", stderr)
        fflush(stderr)
        didFinish.signal()
    }

    private func filterAndConfig(rect: CGRect?) async throws -> (SCContentFilter, SCStreamConfiguration) {
        let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
        let preferredDisplay = CGMainDisplayID()
        guard let display = content.displays.first(where: { $0.displayID == preferredDisplay })
                ?? content.displays.first else {
            throw NSError(domain: "ChelRecordNative", code: 1,
                          userInfo: [NSLocalizedDescriptionKey: "No monitor was found by ScreenCaptureKit"])
        }
        // Explicitly captures the whole monitor, including desktop wallpaper and other apps.
        let filter = SCContentFilter(display: display, excludingWindows: [])
        let cfg = SCStreamConfiguration()
        let scale = max(CGFloat(filter.pointPixelScale), 1.0)
        let width = max(CGFloat(filter.contentRect.width), 1.0)
        let height = max(CGFloat(filter.contentRect.height), 1.0)
        if let rect = rect {
            cfg.sourceRect = CGRect(
                x: width * rect.origin.x, y: height * rect.origin.y,
                width: width * rect.width, height: height * rect.height)
            cfg.width = max(2, (Int(width * scale * rect.width) / 2) * 2)
            cfg.height = max(2, (Int(height * scale * rect.height) / 2) * 2)
        } else {
            cfg.width = max(2, (Int(width * scale) / 2) * 2)
            cfg.height = max(2, (Int(height * scale) / 2) * 2)
        }
        cfg.minimumFrameInterval = CMTime(value: 1, timescale: 30)
        cfg.pixelFormat = kCVPixelFormatType_32BGRA
        cfg.showsCursor = true
        cfg.queueDepth = 5
        cfg.capturesAudio = false
        return (filter, cfg)
    }

    func saveScreenshot(at url: URL, rect: CGRect?) async throws {
        let (filter, cfg) = try await filterAndConfig(rect: rect)
        let image = try await SCScreenshotManager.captureImage(contentFilter: filter, configuration: cfg)
        guard let png = NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:]) else {
            throw NSError(domain: "ChelRecordNative", code: 2,
                          userInfo: [NSLocalizedDescriptionKey: "Could not encode desktop preview PNG"])
        }
        try png.write(to: url, options: .atomic)
        fputs("SAVED\n", stdout)
        fflush(stdout)
    }

    func record(at url: URL, rect: CGRect?, captureMic: Bool) async throws {
        let (filter, cfg) = try await filterAndConfig(rect: rect)
        // ScreenCaptureKit uses the default microphone on macOS 15+ when enabled.
        cfg.captureMicrophone = captureMic
        let stream = SCStream(filter: filter, configuration: cfg, delegate: self)
        self.stream = stream
        let recCfg = SCRecordingOutputConfiguration()
        recCfg.outputURL = url
        recCfg.outputFileType = .mp4
        recCfg.videoCodecType = .h264
        let rec = SCRecordingOutput(configuration: recCfg, delegate: self)
        self.output = rec
        try stream.addRecordingOutput(rec)
        try await stream.startCapture()
        fputs("READY\n", stdout)
        fflush(stdout)

        // Commands arrive through the Electron main process. The only accepted
        // request is "stop"; record until explicitly stopped by the user.
        while let line = readLine(strippingNewline: true) {
            if line.trimmingCharacters(in: .whitespacesAndNewlines) == "stop" { break }
        }
        try await stream.stopCapture()
        // The recording output finalizes the MP4 asynchronously.
        _ = didFinish.wait(timeout: .now() + .seconds(15))
        if let recordingFailure = recordingFailure { throw recordingFailure }
        let size = (try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? NSNumber)?.int64Value ?? 0
        if size < 1024 {
            throw NSError(domain: "ChelRecordNative", code: 3,
                          userInfo: [NSLocalizedDescriptionKey: "No video frames were saved. Check Screen Recording permission."])
        }
        self.output = nil
        self.stream = nil
        fputs("SAVED\n", stdout)
        fflush(stdout)
    }
}

@available(macOS 15.0, *)
@main
struct ChelRecordNative {
    static func rectFromArgs(_ values: [String]) throws -> CGRect? {
        if values.isEmpty { return nil }
        guard values.count == 4,
              let x = Double(values[0]), let y = Double(values[1]),
              let w = Double(values[2]), let h = Double(values[3]),
              x >= 0, y >= 0, w > 0.01, h > 0.01,
              x + w <= 1.001, y + h <= 1.001 else {
            throw NSError(domain: "ChelRecordNative", code: 4,
                          userInfo: [NSLocalizedDescriptionKey: "Invalid region coordinates"])
        }
        return CGRect(x: x, y: y, width: w, height: h)
    }
    static func main() async {
        do {
            let args = Array(CommandLine.arguments.dropFirst())
            guard args.count >= 2 else {
                throw NSError(domain: "ChelRecordNative", code: 5,
                              userInfo: [NSLocalizedDescriptionKey: "Usage: recorder <record|screenshot> <path> [mic 0|1] [x y w h]"])
            }
            let action = args[0]
            let url = URL(fileURLWithPath: args[1])
            let capture = DisplayCapture()
            if action == "screenshot" {
                let rect = try rectFromArgs(Array(args.dropFirst(2)))
                try await capture.saveScreenshot(at: url, rect: rect)
            } else if action == "record" {
                guard args.count >= 3 else { throw NSError(domain: "ChelRecordNative", code: 6,
                              userInfo: [NSLocalizedDescriptionKey: "Missing microphone configuration"]) }
                let rect = try rectFromArgs(Array(args.dropFirst(3)))
                try await capture.record(at: url, rect: rect, captureMic: args[2] == "1")
            } else {
                throw NSError(domain: "ChelRecordNative", code: 7,
                              userInfo: [NSLocalizedDescriptionKey: "Invalid action"])
            }
        } catch {
            fputs("ERROR \(error.localizedDescription)\n", stderr)
            fflush(stderr)
            exit(1)
        }
    }
}
