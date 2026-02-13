import SwiftUI
import Supabase

@MainActor
final class TaskViewModel: ObservableObject {
    @Published var tasks: [DoerTask] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let taskService = TaskService()
    private var loadedContext: String?

    // MARK: - Fetch

    func fetchByProject(projectId: String, force: Bool = false) async {
        guard force || loadedContext != "project:\(projectId)" else { return }
        if tasks.isEmpty { isLoading = true }
        defer { isLoading = false }
        do {
            tasks = try await taskService.fetchByProject(projectId: projectId)
            loadedContext = "project:\(projectId)"
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func fetchForToday(force: Bool = false) async {
        guard force || loadedContext != "today" else { return }
        if tasks.isEmpty { isLoading = true }
        defer { isLoading = false }
        do {
            tasks = try await taskService.fetchForToday()
            loadedContext = "today"
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func fetchForUpcoming(force: Bool = false) async {
        guard force || loadedContext != "upcoming" else { return }
        if tasks.isEmpty { isLoading = true }
        defer { isLoading = false }
        do {
            tasks = try await taskService.fetchForUpcoming()
            loadedContext = "upcoming"
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func fetchSubTasks(parentId: String) async -> [DoerTask] {
        do {
            return try await taskService.fetchSubTasks(parentId: parentId)
        } catch {
            errorMessage = error.localizedDescription
            return []
        }
    }

    func invalidate() {
        loadedContext = nil
    }

    // MARK: - Create

    func createTask(
        title: String,
        projectId: String,
        sectionId: String? = nil,
        parentTaskId: String? = nil,
        priority: Int = 4,
        dueDate: String? = nil
    ) async {
        guard let userId = await AuthService().getUser()?.id.uuidString else { return }

        let lastPosition = tasks
            .filter { $0.sectionId == sectionId && $0.parentTaskId == parentTaskId }
            .map(\.position)
            .max()
        let position = PositionHelpers.getPositionAtEnd(lastPosition: lastPosition)

        do {
            let newTask = try await taskService.create(
                userId: userId,
                title: title,
                projectId: projectId,
                sectionId: sectionId,
                parentTaskId: parentTaskId,
                priority: priority,
                dueDate: dueDate,
                position: position
            )
            tasks.append(newTask)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Toggle / Delete

    func toggleComplete(task: DoerTask) async {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index].isCompleted.toggle()
            if tasks[index].isCompleted {
                let taskId = task.id
                try? await Task.sleep(nanoseconds: 500_000_000)
                tasks.removeAll { $0.id == taskId }
            }
        }
        do {
            try await taskService.toggleComplete(task: task)
        } catch {
            if let index = tasks.firstIndex(where: { $0.id == task.id }) {
                tasks[index].isCompleted.toggle()
            }
            errorMessage = error.localizedDescription
        }
    }

    func deleteTask(id: String) async {
        let removed = tasks.first { $0.id == id }
        tasks.removeAll { $0.id == id }
        do {
            try await taskService.delete(id: id)
        } catch {
            if let removed {
                tasks.append(removed)
            }
            errorMessage = error.localizedDescription
        }
    }

    func updateTask(id: String, fields: TaskUpdate) async {
        do {
            try await taskService.update(id: id, fields: fields)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func addLabel(taskId: String, labelId: String) async {
        do {
            try await taskService.addLabel(taskId: taskId, labelId: labelId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func removeLabel(taskId: String, labelId: String) async {
        do {
            try await taskService.removeLabel(taskId: taskId, labelId: labelId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Computed

    func tasksForSection(projectId: String, sectionId: String?) -> [DoerTask] {
        tasks.filter { $0.projectId == projectId && $0.sectionId == sectionId && $0.parentTaskId == nil }
            .sorted { $0.position < $1.position }
    }

    var todayTasks: [DoerTask] {
        let today = DateHelpers.todayString()
        return tasks.filter { $0.dueDate == today && !$0.isCompleted }
    }

    var overdueTasks: [DoerTask] {
        tasks.filter { DateHelpers.isOverdue($0.dueDate) && !$0.isCompleted }
    }

    var upcomingTasksByDay: [(date: String, tasks: [DoerTask])] {
        let grouped = Dictionary(grouping: tasks.filter { !$0.isCompleted }) { $0.dueDate ?? "" }
        return grouped
            .sorted { $0.key < $1.key }
            .map { (date: $0.key, tasks: $0.value) }
    }
}
