import SwiftUI

struct LabelBadge: View {
    let label: DoerLabel

    var body: some View {
        Text(label.name)
            .font(.caption2)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Color(hex: label.color).opacity(0.2))
            .foregroundColor(Color(hex: label.color))
            .clipShape(Capsule())
    }
}
