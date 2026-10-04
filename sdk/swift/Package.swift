// swift-tools-version:5.9
// Cookwala hub client for Swift. Foundation only (URLSession, JSONSerialization).
import PackageDescription

let package = Package(
    name: "Cookwala",
    platforms: [.macOS(.v13), .iOS(.v16)],
    products: [
        .library(name: "Cookwala", targets: ["Cookwala"]),
    ],
    targets: [
        .target(name: "Cookwala", path: "Sources/Cookwala"),
    ]
)
