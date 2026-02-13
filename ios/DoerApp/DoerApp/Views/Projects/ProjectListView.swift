import SwiftUI

struct ProjectListView: View {
    @EnvironmentObject private var projectVM: ProjectViewModel

    @State private var showCreateProject = false

    var body: some View {
        NavigationStack {
            Group {
                if projectVM.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if projectVM.nonInboxProjects.isEmpty {
                    EmptyStateView(
                        icon: "folder",
                        title: "No projects yet",
                        description: "Create a project to organize your tasks."
                    )
                } else {
                    List {
                        ForEach(projectVM.nonInboxProjects) { project in
                            NavigationLink(value: project) {
                                HStack(spacing: 12) {
                                    Circle()
                                        .fill(Color(hex: project.color))
                                        .frame(width: 12, height: 12)
                                    Text(project.name)
                                        .fontWeight(.medium)
                                    Spacer()
                                }
                            }
                            .swipeActions(edge: .trailing) {
                                Button(role: .destructive) {
                                    Task { await projectVM.deleteProject(id: project.id) }
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Projects")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showCreateProject = true
                    } label: {
                        Image(systemName: "plus")
                            .foregroundColor(.doerRed)
                    }
                }
            }
            .navigationDestination(for: Project.self) { project in
                ProjectView(project: project)
            }
            .sheet(isPresented: $showCreateProject) {
                ProjectFormSheet()
            }
            .task {
                await projectVM.fetchProjects()
            }
        }
    }
}
