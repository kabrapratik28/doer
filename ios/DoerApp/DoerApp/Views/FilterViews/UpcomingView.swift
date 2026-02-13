import SwiftUI

struct UpcomingView: View {
    @EnvironmentObject private var taskVM: TaskViewModel
    @Environment(\.showQuickAdd) private var showQuickAdd
    @Environment(\.showSettings) private var showSettings

    var body: some View {
        NavigationStack {
            Group {
                if taskVM.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if taskVM.upcomingTasksByDay.isEmpty {
                    EmptyStateView(
                        icon: "calendar",
                        title: "All clear ahead",
                        description: "No tasks due in the next 7 days."
                    )
                } else {
                    List {
                        ForEach(taskVM.upcomingTasksByDay, id: \.date) { group in
                            Section {
                                ForEach(group.tasks) { task in
                                    TaskRowView(task: task, showProject: true)
                                }
                            } header: {
                                HStack(spacing: 6) {
                                    Text(DateHelpers.sectionHeader(for: group.date))
                                        .fontWeight(.semibold)
                                    Text("\(group.tasks.count)")
                                        .font(.caption)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.gray.opacity(0.15))
                                        .clipShape(Capsule())
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Upcoming")
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
                await taskVM.fetchForUpcoming()
            }
            .refreshable {
                await taskVM.fetchForUpcoming(force: true)
            }
        }
    }
}
