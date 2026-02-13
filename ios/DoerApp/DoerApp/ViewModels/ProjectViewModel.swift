import SwiftUI
import Supabase

@MainActor
final class ProjectViewModel: ObservableObject {
    @Published var projects: [Project] = []
    @Published var sections: [String: [ProjectSection]] = [:] // keyed by projectId
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let projectService = ProjectService()

    // MARK: - Fetch

    func fetchProjects() async {
        isLoading = true
        defer { isLoading = false }
        do {
            projects = try await projectService.fetchAll()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func fetchSections(projectId: String) async {
        do {
            let result = try await projectService.fetchSections(projectId: projectId)
            sections[projectId] = result
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Create

    func createProject(name: String, color: String) async {
        guard let userId = await AuthService().getUser()?.id.uuidString else { return }
        let lastPosition = projects.map(\.position).max()
        let position = PositionHelpers.getPositionAtEnd(lastPosition: lastPosition)

        do {
            let project = try await projectService.create(
                userId: userId, name: name, color: color, position: position
            )
            projects.append(project)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func deleteProject(id: String) async {
        projects.removeAll { $0.id == id }
        do {
            try await projectService.delete(id: id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Sections

    func createSection(projectId: String, name: String) async {
        guard let userId = await AuthService().getUser()?.id.uuidString else { return }
        let existing = sections[projectId] ?? []
        let lastPosition = existing.map(\.position).max()
        let position = PositionHelpers.getPositionAtEnd(lastPosition: lastPosition)

        do {
            let section = try await projectService.createSection(
                userId: userId, projectId: projectId, name: name, position: position
            )
            sections[projectId, default: []].append(section)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func deleteSection(id: String) async {
        for key in sections.keys {
            sections[key]?.removeAll { $0.id == id }
        }
        do {
            try await projectService.deleteSection(id: id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Computed

    var inboxProject: Project? {
        projects.first { $0.isInbox }
    }

    var nonInboxProjects: [Project] {
        projects.filter { !$0.isInbox }
    }
}
