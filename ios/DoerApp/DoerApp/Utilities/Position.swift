import Foundation

enum PositionHelpers {
    /// Returns a position value between two existing positions
    static func getPositionBetween(before: Double?, after: Double?) -> Double {
        switch (before, after) {
        case let (b?, a?):
            return (b + a) / 2.0
        case let (b?, nil):
            return b + 65536.0
        case let (nil, a?):
            return a / 2.0
        case (nil, nil):
            return 65536.0
        }
    }

    /// Returns a position value after the last known position
    static func getPositionAtEnd(lastPosition: Double?) -> Double {
        guard let lastPosition else { return 65536.0 }
        return lastPosition + 65536.0
    }
}
