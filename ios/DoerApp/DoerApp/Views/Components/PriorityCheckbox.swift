import SwiftUI

struct PriorityCheckbox: View {
    let priority: Int
    let isCompleted: Bool
    let onTap: () -> Void

    private var color: Color {
        switch priority {
        case 1: return .red
        case 2: return .orange
        case 3: return .blue
        default: return .gray
        }
    }

    @State private var scale: CGFloat = 1.0

    var body: some View {
        Button(action: {
            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
            impactFeedback.impactOccurred()

            withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                scale = 0.7
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                    scale = 1.0
                }
            }

            onTap()
        }) {
            Image(systemName: isCompleted ? "checkmark.circle.fill" : "circle")
                .font(.title3)
                .foregroundColor(isCompleted ? .green : color)
                .scaleEffect(scale)
        }
        .buttonStyle(.plain)
    }
}
