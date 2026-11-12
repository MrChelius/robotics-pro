import SwiftUI
import AppKit
import Foundation
import ScreenCaptureKit
import CoreGraphics
import CoreMedia
import CoreVideo

// Transparent, dependency-free macOS screen recorder.
// Uses only Apple's frameworks. No web calls, analytics or auto-updates.
@available(macOS 15.0, *)
enum CaptureMode: String, CaseIterable, Identifiable {
    case full = "Entire desktop"
    case region = "Selected region"
    var id: String { rawValue }
}

@available(macOS 15.0, *)
@MainActor
final class CaptureController: NSObject, ObservableObject, SCRecordingOutputDelegate, SCStreamDelegate {
    @Published var mode: CaptureMode = .full
    @Published var displays: [SCDisplay] = []
    @Published var displayId: CGDirectDisplayID = 0
    @Published var micEnabled = false
    @Published var status = "Ready. Select your monitor and preview the desktop."
    @Published var preview: NSImage?
    @Published var region: CGRect?
    @Published var recording = false
    @Published var busy = false
    @Published var savedFile: URL?

    private var stream: SCStream?
    private var recordingOutput: SCRecordingOutput?
    private var activeFile: URL?
    private var stopError: Error?

    func refresh() async {
        guard !recording && !busy else { return }
        busy = true
        defer { busy = false }
        do {
            let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
            displays = content.displays
            if !displays.contains(where: { $0.displayID == displayId }) {
                displayId = displays.first(where: { $0.displayID == CGMainDisplayID() })?.displayID
                    ?? displays.first?.displayID ?? 0
            }
            if displays.isEmpty {
                status = "No display found. Check the macOS screen recording permission."
            } else {
                status = "Ready. Select Preview or Start recording."
            }
        } catch {
            status = "Cannot list displays: \(error.localizedDescription)"
        }
    }

    private func makeConfiguration() async throws -> (SCContentFilter, SCStreamConfiguration) {
        let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
        guard let display = content.displays.first(where: { $0.displayID == displayId })
                ?? content.displays.first else {
            throw NSError(domain: "ChelRecordNative", code: 1,
                          userInfo: [NSLocalizedDescriptionKey: "No macOS display is available"])
        }
        // Captures a physical monitor, never an application's window.
        let filter = SCContentFilter(display: display, excludingWindows: [])
        let configuration = SCStreamConfiguration()
        let width = max(CGFloat(filter.contentRect.width), 1.0)
        let height = max(CGFloat(filter.contentRect.height), 1.0)
        let pixelScale = max(CGFloat(filter.pointPixelScale), 1.0)
        if mode == .region {
            guard let rect = region, rect.width > 0.02, rect.height > 0.02 else {
                throw NSError(domain: "ChelRecordNative", code: 2,
                              userInfo: [NSLocalizedDescriptionKey: "Select a region on the desktop preview first"])
            }
            configuration.sourceRect = CGRect(
                x: width * rect.origin.x,
                y: height * rect.origin.y,
                width: width * rect.width,
                height: height * rect.height
            )
            configuration.width = max(2, (Int(width * pixelScale * rect.width) / 2) * 2)
            configuration.height = max(2, (Int(height * pixelScale * rect.height) / 2) * 2)
        } else {
            configuration.width = max(2, (Int(width * pixelScale) / 2) * 2)
            configuration.height = max(2, (Int(height * pixelScale) / 2) * 2)
        }
        configuration.minimumFrameInterval = CMTime(value: 1, timescale: 30)
        configuration.pixelFormat = kCVPixelFormatType_32BGRA
        configuration.showsCursor = true
        configuration.queueDepth = 5
        configuration.capturesAudio = false
        configuration.captureMicrophone = micEnabled
        return (filter, configuration)
    }

    func refreshPreview() async {
        guard !recording && !busy else { return }
        busy = true
        defer { busy = false }
        do {
            // Always take a full-monitor screenshot so a region can be selected
            // without offsetting its normalized coordinates.
            let oldMode = mode
            mode = .full
            defer { mode = oldMode }
            let (filter, configuration) = try await makeConfiguration()
            let screenshot = try await SCScreenshotManager.captureImage(
                contentFilter: filter, configuration: configuration)
            preview = NSImage(cgImage: screenshot,
                              size: NSSize(width: screenshot.width, height: screenshot.height))
            status = "Desktop preview ready. Select a region if needed."
        } catch {
            status = "Desktop preview failed: \(error.localizedDescription)"
        }
    }

    func start() async {
        guard !recording && !busy else { return }
        if mode == .region && (region == nil || region!.width < 0.02 || region!.height < 0.02) {
            status = "Choose Preview and drag a region before recording."
            return
        }

        let panel = NSSavePanel()
        panel.title = "Save desktop recording"
        panel.nameFieldStringValue = "ChelRecord-\(Int(Date().timeIntervalSince1970)).mp4"
        panel.allowedFileTypes = ["mp4"]
        panel.canCreateDirectories = true
        guard panel.runModal() == .OK, let fileURL = panel.url else { return }

        busy = true
        defer { busy = false }
        do {
            let (filter, configuration) = try await makeConfiguration()
            let stream = SCStream(filter: filter, configuration: configuration, delegate: self)
            let recordConfiguration = SCRecordingOutputConfiguration()
            recordConfiguration.outputURL = fileURL
            recordConfiguration.outputFileType = .mp4
            recordConfiguration.videoCodecType = .h264
            let recordingOutput = SCRecordingOutput(configuration: recordConfiguration, delegate: self)
            try stream.addRecordingOutput(recordingOutput)
            try await stream.startCapture()
            self.stream = stream
            self.recordingOutput = recordingOutput
            activeFile = fileURL
            savedFile = nil
            stopError = nil
            recording = true
            status = "Recording the Mac desktop. Open Finder or other apps, then Stop & Save."
        } catch {
            status = "Cannot start desktop recording: \(error.localizedDescription)"
            recording = false
        }
    }

    func stop() async {
        guard recording && !busy, let stream else { return }
        busy = true
        defer { busy = false }
        do {
            status = "Finishing MP4…"
            try await stream.stopCapture()
            recording = false
            self.stream = nil
            self.recordingOutput = nil

            // ScreenCaptureKit finalizes its recording output asynchronously.
            // Check for a nonempty file instead of reporting success on the first callback.
            if let file = activeFile {
                var fileSize: UInt64 = 0
                for _ in 0..<30 {
                    if let size = (try? FileManager.default.attributesOfItem(atPath: file.path)[.size] as? NSNumber)?.uint64Value {
                        fileSize = size
                    }
                    if fileSize > 1024 { break }
                    try? await Task.sleep(nanoseconds: 200_000_000)
                }
                if let error = stopError { throw error }
                if fileSize > 1024 {
                    savedFile = file
                    status = "Saved MP4 to \(file.path)"
                } else {
                    status = "The output file is empty. No successful recording was produced."
                }
            } else {
                status = "No output file available."
            }
        } catch {
            recording = false
            self.stream = nil
            recordingOutput = nil
            status = "Recording failed: \(error.localizedDescription)"
        }
    }

    nonisolated func recordingOutputDidStartRecording(_ recordingOutput: SCRecordingOutput) {
        Task { @MainActor in status = "Recording the entire macOS desktop." }
    }

    nonisolated func recordingOutputDidFinishRecording(_ recordingOutput: SCRecordingOutput) {
        Task { @MainActor in
            if recording { status = "Capture finished. Stop & Save to finalize." }
        }
    }

    nonisolated func recordingOutput(_ recordingOutput: SCRecordingOutput, didFailWithError error: any Error) {
        Task { @MainActor in
            stopError = error
            status = "ScreenCaptureKit error: \(error.localizedDescription)"
        }
    }

    nonisolated func stream(_ stream: SCStream, didStopWithError error: any Error) {
        Task { @MainActor in
            stopError = error
            status = "Capture stopped: \(error.localizedDescription)"
            recording = false
        }
    }
}

@available(macOS 15.0, *)
struct DesktopPreview: View {
    @ObservedObject var controller: CaptureController
    @State private var dragStart: CGPoint?

    var body: some View {
        GeometryReader { bounds in
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(red: 0.065, green: 0.08, blue: 0.10))
                if let image = controller.preview {
                    let dimensions = fit(image: image.size, within: bounds.size)
                    Image(nsImage: image)
                        .resizable()
                        .frame(width: dimensions.width, height: dimensions.height)
                        .overlay(alignment: .topLeading) {
                            if let rect = controller.region, controller.mode == .region {
                                Rectangle()
                                    .fill(Color.blue.opacity(0.16))
                                    .overlay(Rectangle().stroke(Color(red: 0.61, green: 0.78, blue: 0.96), lineWidth: 2))
                                    .frame(width: dimensions.width * rect.width, height: dimensions.height * rect.height)
                                    .offset(x: dimensions.width * rect.minX, y: dimensions.height * rect.minY)
                                    .allowsHitTesting(false)
                            }
                        }
                        .contentShape(Rectangle())
                        .gesture(DragGesture(minimumDistance: 2)
                            .onChanged { value in
                                guard controller.mode == .region, !controller.recording else { return }
                                if dragStart == nil { dragStart = value.startLocation }
                                if let start = dragStart {
                                    controller.region = normalized(start, value.location, in: dimensions)
                                }
                            }
                            .onEnded { value in
                                if let start = dragStart, controller.mode == .region {
                                    controller.region = normalized(start, value.location, in: dimensions)
                                }
                                dragStart = nil
                            })
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "display")
                            .font(.system(size: 46, weight: .ultraLight))
                            .foregroundStyle(.secondary)
                        Text("Desktop preview")
                            .font(.title3.weight(.medium))
                        Text("Select a monitor and click Preview")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .overlay(RoundedRectangle(cornerRadius: 12)
                .strokeBorder(Color.white.opacity(0.09)))
        }
    }

    private func fit(image: NSSize, within bounds: CGSize) -> CGSize {
        let scale = min(bounds.width / max(image.width, 1), bounds.height / max(image.height, 1))
        return CGSize(width: image.width * scale, height: image.height * scale)
    }

    private func normalized(_ a: CGPoint, _ b: CGPoint, in dimensions: CGSize) -> CGRect {
        func clamp(_ value: CGFloat) -> CGFloat { max(0, min(1, value)) }
        let x0 = clamp(min(a.x, b.x) / dimensions.width)
        let y0 = clamp(min(a.y, b.y) / dimensions.height)
        let x1 = clamp(max(a.x, b.x) / dimensions.width)
        let y1 = clamp(max(a.y, b.y) / dimensions.height)
        return CGRect(x: x0, y: y0, width: max(0, x1 - x0), height: max(0, y1 - y0))
    }
}

@available(macOS 15.0, *)
struct MainView: View {
    @StateObject private var controller = CaptureController()

    private var bg: Color { Color(red: 0.075, green: 0.091, blue: 0.114) }
    private var surface: Color { Color(red: 0.112, green: 0.133, blue: 0.16) }

    var body: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 18) {
                HStack(spacing: 12) {
                    Image(systemName: "record.circle")
                        .font(.title2)
                        .foregroundStyle(Color(red: 0.93, green: 0.42, blue: 0.45))
                    VStack(alignment: .leading, spacing: 2) {
                        Text("ChelRecord Native").font(.system(size: 18, weight: .semibold))
                        Text("Apple ScreenCaptureKit").font(.caption).foregroundStyle(.secondary)
                    }
                }
                Divider()

                Text("CAPTURE SOURCE").font(.caption2.weight(.semibold)).tracking(1.3).foregroundStyle(.secondary)
                Picker("Display", selection: $controller.displayId) {
                    ForEach(controller.displays, id: \.displayID) { display in
                        Text("Display \(display.displayID) • \(display.width)×\(display.height)")
                            .tag(display.displayID)
                    }
                }
                .labelsHidden()

                Button("Refresh displays") { Task { await controller.refresh() } }
                    .buttonStyle(.bordered)
                    .disabled(controller.recording || controller.busy)

                Text("RECORDING MODE").font(.caption2.weight(.semibold)).tracking(1.3).foregroundStyle(.secondary)
                Picker("Mode", selection: $controller.mode) {
                    ForEach(CaptureMode.allCases) { m in Text(m.rawValue).tag(m) }
                }
                .pickerStyle(.radioGroup)
                .disabled(controller.recording || controller.busy)

                if controller.mode == .region {
                    Text("Click Preview, then drag over the part of the actual desktop image you want to record.")
                        .font(.caption).foregroundStyle(.secondary)
                    Button("Clear selection") { controller.region = nil }
                        .buttonStyle(.bordered)
                        .disabled(controller.recording)
                }

                Divider()

                Toggle("Include default microphone", isOn: $controller.micEnabled)
                    .disabled(controller.recording)
                    .font(.subheadline)

                Text("MP4 • H.264 • 30 FPS")
                    .font(.caption).foregroundStyle(.secondary)

                Spacer()

                Text("This build records the desktop only. It contains no Electron, FFmpeg, network client or camera overlay.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(22)
            .frame(width: 265)
            .background(surface)

            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Screen recorder").font(.system(size: 25, weight: .semibold))
                        Text("The entire Mac desktop — not just the ChelRecord window.")
                            .foregroundStyle(.secondary).font(.subheadline)
                    }
                    Spacer()
                    Text(controller.recording ? "● RECORDING" : "LOCAL")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(controller.recording ? .red : .green)
                }

                DesktopPreview(controller: controller)
                    .frame(minHeight: 330)

                HStack(spacing: 10) {
                    Button {
                        Task { await controller.refreshPreview() }
                    } label: {
                        Label("Preview", systemImage: "eye")
                    }
                    .buttonStyle(.bordered)
                    .disabled(controller.recording || controller.busy)

                    if controller.recording {
                        Button {
                            Task { await controller.stop() }
                        } label: {
                            Label("Stop & Save", systemImage: "stop.fill")
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.red)
                    } else {
                        Button {
                            Task { await controller.start() }
                        } label: {
                            Label("Start Recording", systemImage: "record.circle")
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color(red: 0.80, green: 0.31, blue: 0.35))
                    }
                    Spacer()
                    if let url = controller.savedFile {
                        Button("Show MP4") {
                            NSWorkspace.shared.activateFileViewerSelecting([url])
                        }.buttonStyle(.bordered)
                    }
                }
                Text(controller.status)
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Divider()
                Text("Local recording · No sign-in · No analytics · No third-party executable dependencies")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(22)
        }
        .background(bg)
        .frame(minWidth: 975, minHeight: 650)
        .task { await controller.refresh() }
    }
}

@available(macOS 15.0, *)
@main
struct ChelRecordNativeApp: App {
    var body: some Scene {
        WindowGroup {
            MainView()
        }
        .windowStyle(.titleBar)
    }
}
