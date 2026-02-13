import SwiftUI

struct TaskListView: View {
    let tasks: [DoerTask]
    var showProject: Bool = false

    var body: some View {
        if tasks.isEmpty {
            EmptyStateView(
                icon: "checkmark.circle",
                title: "All clear",
                description: "No tasks here. Enjoy the calm!"
            )
        } else {
            List {
                ForEach(tasks) { task in
                    TaskRowView(task: task, showProject: showProject)
                }
            }
            .listStyle(.plain)
        }
    }
}
