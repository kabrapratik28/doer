import SwiftUI
import Supabase

@MainActor
final class LabelViewModel: ObservableObject {
    @Published var labels: [DoerLabel] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let labelService = LabelService()

    func fetchLabels() async {
        isLoading = true
        defer { isLoading = false }
        do {
            labels = try await labelService.fetchAll()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createLabel(name: String, color: String) async {
        guard let userId = await AuthService().getUser()?.id.uuidString else { return }
        do {
            let label = try await labelService.create(userId: userId, name: name, color: color)
            labels.append(label)
            labels.sort { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateLabel(id: String, name: String, color: String) async {
        do {
            try await labelService.update(id: id, name: name, color: color)
            if let index = labels.firstIndex(where: { $0.id == id }) {
                labels[index] = DoerLabel(
                    id: labels[index].id,
                    userId: labels[index].userId,
                    name: name,
                    color: color,
                    createdAt: labels[index].createdAt
                )
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func deleteLabel(id: String) async {
        labels.removeAll { $0.id == id }
        do {
            try await labelService.delete(id: id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
