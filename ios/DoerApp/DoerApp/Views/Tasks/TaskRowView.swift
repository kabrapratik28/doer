import SwiftUI

struct TaskRowView: View {
    let task: DoerTask
    var showProject: Bool = false
    @EnvironmentObject private var taskVM: TaskViewModel

    @State private var showDetail = false

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            PriorityCheckbox(
                priority: task.priority,
                isCompleted: task.isCompleted
            ) {
                Task {
                    await taskVM.toggleComplete(task: task)
                }
            }
            .padding(.top, 2)

            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .font(.body)
                    .strikethrough(task.isCompleted)
                    .foregroundColor(task.isCompleted ? .secondary : .primary)
                    .lineLimit(2)

                HStack(spacing: 8) {
                    // Due date badge
                    if let dueDateText = DateHelpers.formatDueDate(task.dueDate) {
                        HStack(spacing: 3) {
                            Image(systemName: "calendar")
                                .font(.caption2)
                            Text(dueDateText)
                                .font(.caption)
                        }
                        .foregroundColor(DateHelpers.dueDateColor(task.dueDate))
                    }

                    // Project badge
                    if showProject, let project = task.project {
                        HStack(spacing: 3) {
                            Circle()
                                .fill(Color(hex: project.color))
                                .frame(width: 6, height: 6)
                            Text(project.name)
                                .font(.caption)
                        }
                        .foregroundColor(.secondary)
                    }

                    // Label badges
                    if let labels = task.labels, !labels.isEmpty {
                        ForEach(labels) { label in
                            LabelBadge(label: label)
                        }
                    }
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
        .onTapGesture {
            showDetail = true
        }
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
            Button {
                Task {
                    await taskVM.toggleComplete(task: task)
                }
            } label: {
                Label("Complete", systemImage: "checkmark.circle")
            }
            .tint(.green)
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive) {
                Task {
                    await taskVM.deleteTask(id: task.id)
                }
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
        .sheet(isPresented: $showDetail) {
            TaskDetailView(task: task)
        }
    }
}
