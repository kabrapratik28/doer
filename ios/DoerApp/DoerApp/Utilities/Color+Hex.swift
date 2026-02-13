import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)

        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }

    /// The app's primary accent color (red #dc2626)
    static let doerRed = Color(hex: "dc2626")

    /// Common project/label colors
    static let projectColors: [(name: String, hex: String)] = [
        ("Red", "dc2626"),
        ("Orange", "ea580c"),
        ("Amber", "d97706"),
        ("Yellow", "ca8a04"),
        ("Lime", "65a30d"),
        ("Green", "16a34a"),
        ("Emerald", "059669"),
        ("Teal", "0d9488"),
        ("Cyan", "0891b2"),
        ("Sky", "0284c7"),
        ("Blue", "2563eb"),
        ("Indigo", "4f46e5"),
        ("Violet", "7c3aed"),
        ("Purple", "9333ea"),
        ("Fuchsia", "c026d3"),
        ("Pink", "db2777"),
        ("Rose", "e11d48"),
        ("Slate", "475569"),
        ("Gray", "6b7280"),
        ("Stone", "78716c"),
    ]
}
