import SwiftUI

enum DateHelpers {
    private static let dateFormatter: DateFormatter = {
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        df.locale = Locale(identifier: "en_US_POSIX")
        return df
    }()

    private static let displayFormatter: DateFormatter = {
        let df = DateFormatter()
        df.dateFormat = "EEE, MMM d"
        return df
    }()

    private static let dayOfWeekFormatter: DateFormatter = {
        let df = DateFormatter()
        df.dateFormat = "EEEE"
        return df
    }()

    /// Returns today's date as "yyyy-MM-dd"
    static func todayString() -> String {
        dateFormatter.string(from: Date())
    }

    /// Returns a date string for N days from now
    static func dateString(daysFromNow days: Int) -> String {
        let date = Calendar.current.date(byAdding: .day, value: days, to: Date()) ?? Date()
        return dateFormatter.string(from: date)
    }

    /// Formats a date string like "yyyy-MM-dd" into a user-friendly label
    static func formatDueDate(_ dateStr: String?) -> String? {
        guard let dateStr, let date = dateFormatter.date(from: dateStr) else { return nil }

        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let target = calendar.startOfDay(for: date)
        let diff = calendar.dateComponents([.day], from: today, to: target).day ?? 0

        switch diff {
        case ..<0:
            return "Overdue"
        case 0:
            return "Today"
        case 1:
            return "Tomorrow"
        case 2...6:
            return dayOfWeekFormatter.string(from: date)
        default:
            return displayFormatter.string(from: date)
        }
    }

    /// Returns a color for the due date label
    static func dueDateColor(_ dateStr: String?) -> Color {
        guard let dateStr, let date = dateFormatter.date(from: dateStr) else { return .secondary }

        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let target = calendar.startOfDay(for: date)
        let diff = calendar.dateComponents([.day], from: today, to: target).day ?? 0

        if diff < 0 { return .red }
        if diff == 0 { return Color.doerRed }
        if diff == 1 { return .orange }
        return .secondary
    }

    /// Returns true if the date string is before today
    static func isOverdue(_ dateStr: String?) -> Bool {
        guard let dateStr, let date = dateFormatter.date(from: dateStr) else { return false }
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let target = calendar.startOfDay(for: date)
        return target < today
    }

    /// Parses a "yyyy-MM-dd" string into a Date
    static func parseDate(_ dateStr: String) -> Date? {
        dateFormatter.date(from: dateStr)
    }

    /// Formats a Date to "yyyy-MM-dd"
    static func formatToString(_ date: Date) -> String {
        dateFormatter.string(from: date)
    }

    /// Returns the display header for a given date string, e.g. "Today - Wed, Feb 12"
    static func sectionHeader(for dateStr: String) -> String {
        guard let date = dateFormatter.date(from: dateStr) else { return dateStr }
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let target = calendar.startOfDay(for: date)
        let diff = calendar.dateComponents([.day], from: today, to: target).day ?? 0

        let formatted = displayFormatter.string(from: date)
        switch diff {
        case 0: return "Today \u{2022} \(formatted)"
        case 1: return "Tomorrow \u{2022} \(formatted)"
        default: return formatted
        }
    }
}
