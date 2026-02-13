import SwiftUI
import Supabase

struct TaskDetailView: View {
    let task: DoerTask

    @EnvironmentObject private var taskVM: TaskViewModel
    @EnvironmentObject private var projectVM: ProjectViewModel
    @EnvironmentObject private var labelVM: LabelViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title: String
    @State private var description: String
    @State private var selectedProjectId: String
    @State private var selectedPriority: Int
    @State private var dueDate: Date?
    @State private var hasDueDate: Bool
    @State private var subTasks: [DoerTask] = []
    @State private var newSubTaskTitle = ""
    @State private var taskLabels: Set<String>
    @State private var showDeleteConfirm = false

    init(task: DoerTask) {
        self.task = task
        _title = State(initialValue: task.title)
        _description = State(initialValue: task.description)
        _selectedProjectId = State(initialValue: task.projectId)
        _selectedPriority = State(initialValue: task.priority)
        let parsedDate = task.dueDate.flatMap { DateHelpers.parseDate($0) }
        _dueDate = State(initialValue: parsedDate)
        _hasDueDate = State(initialValue: task.dueDate != nil)
        _taskLabels = State(initialValue: Set(task.labels?.map(\.id) ?? []))
    }

    var body: some View {
        NavigationStack {
            Form {
                // Title & Description
                Section {
                    TextField("Task title", text: $title)
                        .font(.headline)

                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }

                // Project
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

                // Priority
                Section("Priority") {
                    Picker("Priority", selection: $selectedPriority) {
                        ForEach(Priority.allCases, id: \.rawValue) { p in
                            Text(p.label).tag(p.rawValue)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                // Due Date
                Section("Due Date") {
                    Toggle("Set due date", isOn: $hasDueDate)
                    if hasDueDate {
                        DatePicker(
                            "Date",
                            selection: Binding(
                                get: { dueDate ?? Date() },
                                set: { dueDate = $0 }
                            ),
                            displayedComponents: .date
                        )
                        .datePickerStyle(.graphical)
                        .tint(.doerRed)
                    }
                }

                // Labels
                Section("Labels") {
                    if labelVM.labels.isEmpty {
                        Text("No labels yet")
                            .foregroundColor(.secondary)
                    } else {
                        FlowLayout(spacing: 8) {
                            ForEach(labelVM.labels) { label in
                                Button {
                                    toggleLabel(label)
                                } label: {
                                    Text(label.name)
                                        .font(.caption)
                                        .fontWeight(.medium)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 6)
                                        .background(
                                            taskLabels.contains(label.id)
                                                ? Color(hex: label.color).opacity(0.3)
                                                : Color(.systemGray5)
                                        )
                                        .foregroundColor(
                                            taskLabels.contains(label.id)
                                                ? Color(hex: label.color)
                                                : .secondary
                                        )
                                        .clipShape(Capsule())
                                        .overlay(
                                            Capsule()
                                                .strokeBorder(
                                                    taskLabels.contains(label.id)
                                                        ? Color(hex: label.color)
                                                        : Color.clear,
                                                    lineWidth: 1
                                                )
                                        )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }

                // Sub-tasks
                Section("Sub-tasks") {
                    ForEach(subTasks) { sub in
                        HStack(spacing: 10) {
                            PriorityCheckbox(
                                priority: sub.priority,
                                isCompleted: sub.isCompleted
                            ) {
                                Task { await taskVM.toggleComplete(task: sub) }
                            }
                            Text(sub.title)
                                .strikethrough(sub.isCompleted)
                                .foregroundColor(sub.isCompleted ? .secondary : .primary)
                        }
                    }

                    HStack {
                        TextField("Add sub-task", text: $newSubTaskTitle)
                        Button {
                            guard !newSubTaskTitle.isEmpty else { return }
                            let titleToAdd = newSubTaskTitle
                            newSubTaskTitle = ""
                            Task {
                                await taskVM.createTask(
                                    title: titleToAdd,
                                    projectId: task.projectId,
                                    parentTaskId: task.id
                                )
                                subTasks = await taskVM.fetchSubTasks(parentId: task.id)
                            }
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.doerRed)
                        }
                        .disabled(newSubTaskTitle.isEmpty)
                    }
                }

                // Delete
                Section {
                    Button(role: .destructive) {
                        showDeleteConfirm = true
                    } label: {
                        HStack {
                            Spacer()
                            Label("Delete Task", systemImage: "trash")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Task Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveChanges()
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(.doerRed)
                }
            }
            .task {
                subTasks = await taskVM.fetchSubTasks(parentId: task.id)
            }
            .alert("Delete Task", isPresented: $showDeleteConfirm) {
                Button("Delete", role: .destructive) {
                    Task {
                        await taskVM.deleteTask(id: task.id)
                        dismiss()
                    }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("Are you sure you want to delete this task?")
            }
        }
    }

    private func toggleLabel(_ label: DoerLabel) {
        if taskLabels.contains(label.id) {
            taskLabels.remove(label.id)
            Task { await taskVM.removeLabel(taskId: task.id, labelId: label.id) }
        } else {
            taskLabels.insert(label.id)
            Task { await taskVM.addLabel(taskId: task.id, labelId: label.id) }
        }
    }

    private func saveChanges() {
        var fields = TaskUpdate()
        if title != task.title { fields.title = title }
        if description != task.description { fields.description = description }
        if selectedProjectId != task.projectId { fields.project_id = selectedProjectId }
        if selectedPriority != task.priority { fields.priority = selectedPriority }

        if hasDueDate, let date = dueDate {
            let dateStr = DateHelpers.formatToString(date)
            if dateStr != task.dueDate { fields.due_date = dateStr }
        } else if !hasDueDate && task.dueDate != nil {
            fields.due_date = nil
        }

        let needsUpdate = fields.title != nil || fields.description != nil ||
            fields.project_id != nil || fields.priority != nil || fields.due_date != nil
        if needsUpdate {
            Task {
                await taskVM.updateTask(id: task.id, fields: fields)
            }
        }
        dismiss()
    }
}

// MARK: - Flow Layout for label pills

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layout(in: proposal.width ?? 0, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(in: bounds.width, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: .unspecified
            )
        }
    }

    private func layout(in maxWidth: CGFloat, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var maxX: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            maxX = max(maxX, x)
        }

        return (positions, CGSize(width: maxX, height: y + rowHeight))
    }
}
