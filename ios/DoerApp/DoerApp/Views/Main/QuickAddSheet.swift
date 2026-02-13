import SwiftUI

struct QuickAddSheet: View {
    @EnvironmentObject private var taskVM: TaskViewModel
    @EnvironmentObject private var projectVM: ProjectViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var selectedProjectId: String = ""
    @State private var selectedPriority: Int = 4
    @State private var hasDueDate = false
    @State private var dueDate = Date()

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Task name", text: $title)
                        .font(.headline)
                }

                Section("Project") {
                    Picker("Project", selection: $selectedProjectId) {
                        ForEach(projectVM.projects) { project in
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(Color(hex: project.color))
                                    .frame(width: 8, height: 8)
                                Text(project.name)
                            }
                            .tag(project.id)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section("Priority") {
                    Picker("Priority", selection: $selectedPriority) {
                        ForEach(Priority.allCases, id: \.rawValue) { p in
                            Text(p.label).tag(p.rawValue)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Due Date") {
                    Toggle("Set due date", isOn: $hasDueDate)
                    if hasDueDate {
                        DatePicker("Date", selection: $dueDate, displayedComponents: .date)
                            .datePickerStyle(.graphical)
                            .tint(.doerRed)
                    }
                }
            }
            .navigationTitle("Quick Add")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        let dateStr = hasDueDate ? DateHelpers.formatToString(dueDate) : nil
                        Task {
                            await taskVM.createTask(
                                title: title,
                                projectId: selectedProjectId,
                                priority: selectedPriority,
                                dueDate: dateStr
                            )
                            dismiss()
                        }
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(.doerRed)
                    .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear {
                if selectedProjectId.isEmpty {
                    selectedProjectId = projectVM.inboxProject?.id ?? projectVM.projects.first?.id ?? ""
                }
            }
        }
    }
}
