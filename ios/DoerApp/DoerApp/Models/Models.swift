import Foundation

struct Profile: Codable, Identifiable {
    let id: String
    var email: String
    var fullName: String
    var avatarUrl: String
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, email
        case fullName = "full_name"
        case avatarUrl = "avatar_url"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct Project: Codable, Identifiable, Hashable {
    let id: String
    let userId: String
    var name: String
    var color: String
    var isInbox: Bool
    var isArchived: Bool
    var position: Double
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, name, color, position
        case userId = "user_id"
        case isInbox = "is_inbox"
        case isArchived = "is_archived"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct ProjectSection: Codable, Identifiable, Hashable {
    let id: String
    let projectId: String
    let userId: String
    var name: String
    var position: Double
    var isCollapsed: Bool
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, name, position
        case projectId = "project_id"
        case userId = "user_id"
        case isCollapsed = "is_collapsed"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct DoerLabel: Codable, Identifiable, Hashable {
    let id: String
    let userId: String
    var name: String
    var color: String
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, name, color
        case userId = "user_id"
        case createdAt = "created_at"
    }
}

struct TaskLabelJoin: Codable {
    let labelId: String
    let labels: DoerLabel

    enum CodingKeys: String, CodingKey {
        case labelId = "label_id"
        case labels
    }
}

struct ProjectRef: Codable, Hashable {
    let id: String
    let name: String
    let color: String
}

enum Priority: Int, Codable, CaseIterable {
    case p1 = 1, p2 = 2, p3 = 3, p4 = 4

    var label: String {
        switch self {
        case .p1: return "P1"
        case .p2: return "P2"
        case .p3: return "P3"
        case .p4: return "P4"
        }
    }
}

struct DoerTask: Codable, Identifiable, Hashable {
    let id: String
    let userId: String
    var projectId: String
    var sectionId: String?
    var parentTaskId: String?
    var title: String
    var description: String
    var priority: Int
    var isCompleted: Bool
    var completedAt: String?
    var dueDate: String?
    var position: Double
    let createdAt: String
    let updatedAt: String
    var labels: [DoerLabel]?
    var project: ProjectRef?

    enum CodingKeys: String, CodingKey {
        case id, title, description, priority, position
        case userId = "user_id"
        case projectId = "project_id"
        case sectionId = "section_id"
        case parentTaskId = "parent_task_id"
        case isCompleted = "is_completed"
        case completedAt = "completed_at"
        case dueDate = "due_date"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case labels, project
    }

    static func == (lhs: DoerTask, rhs: DoerTask) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    var priorityEnum: Priority {
        Priority(rawValue: priority) ?? .p4
    }
}

struct TaskWithLabels: Codable {
    let id: String
    let userId: String
    var projectId: String
    var sectionId: String?
    var parentTaskId: String?
    var title: String
    var description: String
    var priority: Int
    var isCompleted: Bool
    var completedAt: String?
    var dueDate: String?
    var position: Double
    let createdAt: String
    let updatedAt: String
    var labels: [TaskLabelJoin]?
    var project: ProjectRef?

    enum CodingKeys: String, CodingKey {
        case id, title, description, priority, position, labels, project
        case userId = "user_id"
        case projectId = "project_id"
        case sectionId = "section_id"
        case parentTaskId = "parent_task_id"
        case isCompleted = "is_completed"
        case completedAt = "completed_at"
        case dueDate = "due_date"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    func toDoerTask() -> DoerTask {
        DoerTask(
            id: id, userId: userId, projectId: projectId,
            sectionId: sectionId, parentTaskId: parentTaskId,
            title: title, description: description, priority: priority,
            isCompleted: isCompleted, completedAt: completedAt,
            dueDate: dueDate, position: position,
            createdAt: createdAt, updatedAt: updatedAt,
            labels: labels?.map { $0.labels },
            project: project
        )
    }
}
