import SwiftUI

struct InboxView: View {
    @EnvironmentObject private var projectVM: ProjectViewModel
    @EnvironmentObject private var taskVM: TaskViewModel
    @Environment(\.showQuickAdd) private var showQuickAdd
    @Environment(\.showSettings) private var showSettings

    @State private var newTaskTitle = ""

    private var inboxProject: Project? {
        projectVM.inboxProject
    }

    var body: some View {
        NavigationStack {
            Group {
                if taskVM.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    let inboxTasks = taskVM.tasks.filter { !$0.isCompleted && $0.parentTaskId == nil }
                    if inboxTasks.isEmpty && newTaskTitle.isEmpty {
                        EmptyStateView(
                            icon: "tray",
                            title: "Inbox is empty",
                            description: "Tasks without a project land here."
                        )
                    } else {
                        List {
                            ForEach(inboxTasks) { task in
                                TaskRowView(task: task)
                            }

                            if inboxProject != nil {
                                HStack(spacing: 10) {
                                    Image(systemName: "plus")
                                        .foregroundColor(.doerRed)
                                        .font(.caption)
                                    TextField("Add task", text: $newTaskTitle)
                                        .onSubmit {
                                            addTask()
                                        }
                                }
                                .foregroundColor(.secondary)
                            }
                        }
                        .listStyle(.plain)
                    }
                }
            }
            .navigationTitle("Inbox")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    HStack(spacing: 14) {
                        Button { showQuickAdd.wrappedValue = true } label: {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.doerRed)
                        }
                        Button { showSettings.wrappedValue = true } label: {
                            Image(systemName: "gearshape")
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            .task {
                if let inbox = inboxProject {
                    await taskVM.fetchByProject(projectId: inbox.id)
                }
            }
            .refreshable {
                if let inbox = inboxProject {
                    await taskVM.fetchByProject(projectId: inbox.id, force: true)
                }
            }
            .onChange(of: projectVM.inboxProject?.id) { _, newValue in
                if let id = newValue {
                    _Concurrency.Task { await taskVM.fetchByProject(projectId: id) }
                }
            }
        }
    }

    private func addTask() {
        guard !newTaskTitle.isEmpty, let inbox = inboxProject else { return }
        let title = newTaskTitle
        newTaskTitle = ""
        _Concurrency.Task {
            await taskVM.createTask(title: title, projectId: inbox.id)
        }
    }
}
