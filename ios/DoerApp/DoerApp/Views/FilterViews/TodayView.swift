import SwiftUI

struct TodayView: View {
    @EnvironmentObject private var taskVM: TaskViewModel
    @Environment(\.showQuickAdd) private var showQuickAdd
    @Environment(\.showSettings) private var showSettings

    var body: some View {
        NavigationStack {
            Group {
                if taskVM.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if taskVM.overdueTasks.isEmpty && taskVM.todayTasks.isEmpty {
                    EmptyStateView(
                        icon: "sun.max.fill",
                        title: "Enjoy your day!",
                        description: "No tasks due today."
                    )
                } else {
                    List {
                        if !taskVM.overdueTasks.isEmpty {
                            Section {
                                ForEach(taskVM.overdueTasks) { task in
                                    TaskRowView(task: task, showProject: true)
                                }
                            } header: {
                                HStack(spacing: 6) {
                                    Text("Overdue")
                                        .foregroundColor(.red)
                                        .fontWeight(.semibold)
                                    Text("\(taskVM.overdueTasks.count)")
                                        .font(.caption)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.red.opacity(0.15))
                                        .foregroundColor(.red)
                                        .clipShape(Capsule())
                                }
                            }
                        }

                        if !taskVM.todayTasks.isEmpty {
                            Section {
                                ForEach(taskVM.todayTasks) { task in
                                    TaskRowView(task: task, showProject: true)
                                }
                            } header: {
                                HStack(spacing: 6) {
                                    Text("Today")
                                        .fontWeight(.semibold)
                                    Text("\(taskVM.todayTasks.count)")
                                        .font(.caption)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.doerRed.opacity(0.15))
                                        .foregroundColor(.doerRed)
                                        .clipShape(Capsule())
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Today")
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
                await taskVM.fetchForToday()
            }
            .refreshable {
                await taskVM.fetchForToday(force: true)
            }
        }
    }
}
