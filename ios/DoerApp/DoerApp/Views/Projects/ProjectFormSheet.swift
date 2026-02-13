import SwiftUI

struct ProjectFormSheet: View {
    @EnvironmentObject private var projectVM: ProjectViewModel
    @Environment(\.dismiss) private var dismiss

    var editingProject: Project?

    @State private var name: String
    @State private var selectedColor: String

    init(editingProject: Project? = nil) {
        self.editingProject = editingProject
        _name = State(initialValue: editingProject?.name ?? "")
        _selectedColor = State(initialValue: editingProject?.color ?? "dc2626")
    }

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 12), count: 5)

    var body: some View {
        NavigationStack {
            Form {
                Section("Project Name") {
                    TextField("Name", text: $name)
                }

                Section("Color") {
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(Color.projectColors, id: \.hex) { item in
                            Circle()
                                .fill(Color(hex: item.hex))
                                .frame(width: 36, height: 36)
                                .overlay(
                                    Circle()
                                        .strokeBorder(Color.primary, lineWidth: selectedColor == item.hex ? 2.5 : 0)
                                        .frame(width: 42, height: 42)
                                )
                                .overlay(
                                    selectedColor == item.hex
                                        ? Image(systemName: "checkmark")
                                            .font(.caption.bold())
                                            .foregroundColor(.white)
                                        : nil
                                )
                                .onTapGesture {
                                    selectedColor = item.hex
                                }
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section {
                    HStack {
                        Circle()
                            .fill(Color(hex: selectedColor))
                            .frame(width: 14, height: 14)
                        Text(name.isEmpty ? "Project Preview" : name)
                            .fontWeight(.medium)
                    }
                } header: {
                    Text("Preview")
                }
            }
            .navigationTitle(editingProject == nil ? "New Project" : "Edit Project")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(editingProject == nil ? "Create" : "Save") {
                        Task {
                            await projectVM.createProject(name: name, color: selectedColor)
                            dismiss()
                        }
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(.doerRed)
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}
