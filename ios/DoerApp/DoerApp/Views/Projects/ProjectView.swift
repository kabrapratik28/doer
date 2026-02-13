import SwiftUI

struct ProjectView: View {
    let project: Project

    @EnvironmentObject private var projectVM: ProjectViewModel
    @EnvironmentObject private var taskVM: TaskViewModel

    @State private var newTaskTitle = ""
    @State private var newTaskSectionId: String?
    @State private var showAddSection = false
    @State private var newSectionName = ""

    private var projectSections: [ProjectSection] {
        projectVM.sections[project.id] ?? []
    }

    var body: some View {
        List {
            // Unsectioned tasks
            let unsectioned = taskVM.tasksForSection(projectId: project.id, sectionId: nil)
            if !unsectioned.isEmpty || newTaskSectionId == nil {
                Section {
                    ForEach(unsectioned) { task in
                        TaskRowView(task: task)
                    }
                    .onMove { source, destination in
                        // Drag reorder handled locally
                    }

                    // Inline add
                    HStack(spacing: 10) {
                        Image(systemName: "plus")
                            .foregroundColor(.doerRed)
                            .font(.caption)
                        TextField("Add task", text: $newTaskTitle)
                            .onSubmit {
                                addTask(sectionId: nil)
                            }
                    }
                    .foregroundColor(.secondary)
                }
            }

            // Sectioned tasks
            ForEach(projectSections) { section in
                Section {
                    let sectionTasks = taskVM.tasksForSection(projectId: project.id, sectionId: section.id)
                    ForEach(sectionTasks) { task in
                        TaskRowView(task: task)
                    }
                    .onMove { _, _ in }

                    // Inline add for section
                    HStack(spacing: 10) {
                        Image(systemName: "plus")
                            .foregroundColor(.doerRed)
                            .font(.caption)
                        TextField("Add task", text: $newTaskTitle)
                            .onSubmit {
                                addTask(sectionId: section.id)
                            }
                    }
                    .foregroundColor(.secondary)
                } header: {
                    HStack {
                        Text(section.name)
                            .fontWeight(.semibold)
                            .textCase(nil)
                        Spacer()
                        Button(role: .destructive) {
                            Task { await projectVM.deleteSection(id: section.id) }
                        } label: {
                            Image(systemName: "xmark.circle")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            // Add section button
            Section {
                if showAddSection {
                    HStack {
                        TextField("Section name", text: $newSectionName)
                            .onSubmit {
                                guard !newSectionName.isEmpty else { return }
                                let name = newSectionName
                                newSectionName = ""
                                showAddSection = false
                                Task {
                                    await projectVM.createSection(projectId: project.id, name: name)
                                }
                            }
                        Button("Add") {
                            guard !newSectionName.isEmpty else { return }
                            let name = newSectionName
                            newSectionName = ""
                            showAddSection = false
                            Task {
                                await projectVM.createSection(projectId: project.id, name: name)
                            }
                        }
                        .foregroundColor(.doerRed)
                    }
                } else {
                    Button {
                        showAddSection = true
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "plus")
                            Text("Add Section")
                        }
                        .foregroundColor(.doerRed)
                    }
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle(project.name)
        .navigationBarTitleDisplayMode(.large)
        .task {
            await projectVM.fetchSections(projectId: project.id)
            await taskVM.fetchByProject(projectId: project.id)
        }
        .refreshable {
            await projectVM.fetchSections(projectId: project.id)
            await taskVM.fetchByProject(projectId: project.id)
        }
    }

    private func addTask(sectionId: String?) {
        guard !newTaskTitle.isEmpty else { return }
        let title = newTaskTitle
        newTaskTitle = ""
        Task {
            await taskVM.createTask(title: title, projectId: project.id, sectionId: sectionId)
        }
    }
}
