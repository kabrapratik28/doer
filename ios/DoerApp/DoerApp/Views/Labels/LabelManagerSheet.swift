import SwiftUI

struct LabelManagerSheet: View {
    @EnvironmentObject private var labelVM: LabelViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var showAddLabel = false
    @State private var editingLabel: DoerLabel?
    @State private var labelName = ""
    @State private var labelColor = "dc2626"

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 10), count: 5)

    var body: some View {
        NavigationStack {
            List {
                if labelVM.labels.isEmpty && !showAddLabel {
                    Section {
                        Text("No labels yet. Tap + to create one.")
                            .foregroundColor(.secondary)
                    }
                }

                ForEach(labelVM.labels) { label in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(Color(hex: label.color))
                            .frame(width: 12, height: 12)
                        Text(label.name)
                            .fontWeight(.medium)
                        Spacer()
                        Button {
                            editingLabel = label
                            labelName = label.name
                            labelColor = label.color
                        } label: {
                            Image(systemName: "pencil")
                                .foregroundColor(.secondary)
                        }
                        .buttonStyle(.plain)
                    }
                    .swipeActions(edge: .trailing) {
                        Button(role: .destructive) {
                            Task { await labelVM.deleteLabel(id: label.id) }
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
                }

                if showAddLabel || editingLabel != nil {
                    Section(editingLabel != nil ? "Edit Label" : "New Label") {
                        TextField("Label name", text: $labelName)

                        LazyVGrid(columns: columns, spacing: 10) {
                            ForEach(Color.projectColors, id: \.hex) { item in
                                Circle()
                                    .fill(Color(hex: item.hex))
                                    .frame(width: 30, height: 30)
                                    .overlay(
                                        labelColor == item.hex
                                            ? Image(systemName: "checkmark")
                                                .font(.caption2.bold())
                                                .foregroundColor(.white)
                                            : nil
                                    )
                                    .onTapGesture {
                                        labelColor = item.hex
                                    }
                            }
                        }
                        .padding(.vertical, 4)

                        HStack {
                            Button("Cancel") {
                                showAddLabel = false
                                editingLabel = nil
                                labelName = ""
                                labelColor = "dc2626"
                            }
                            .foregroundColor(.secondary)

                            Spacer()

                            Button(editingLabel != nil ? "Save" : "Create") {
                                guard !labelName.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                                Task {
                                    if let editing = editingLabel {
                                        await labelVM.updateLabel(id: editing.id, name: labelName, color: labelColor)
                                    } else {
                                        await labelVM.createLabel(name: labelName, color: labelColor)
                                    }
                                    showAddLabel = false
                                    editingLabel = nil
                                    labelName = ""
                                    labelColor = "dc2626"
                                }
                            }
                            .fontWeight(.semibold)
                            .foregroundColor(.doerRed)
                            .disabled(labelName.trimmingCharacters(in: .whitespaces).isEmpty)
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Labels")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        editingLabel = nil
                        labelName = ""
                        labelColor = "dc2626"
                        showAddLabel = true
                    } label: {
                        Image(systemName: "plus")
                            .foregroundColor(.doerRed)
                    }
                }
            }
            .task {
                await labelVM.fetchLabels()
            }
        }
    }
}
