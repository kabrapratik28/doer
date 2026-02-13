import Foundation
import Supabase

struct TaskInsert: Encodable {
    let user_id: String
    let title: String
    let description: String
    let project_id: String
    let section_id: String?
    let parent_task_id: String?
    let priority: Int
    let due_date: String?
    let position: Double
}

struct TaskUpdate: Encodable {
    var title: String?
    var description: String?
    var project_id: String?
    var section_id: String?
    var priority: Int?
    var is_completed: Bool?
    var completed_at: String?
    var due_date: String?
    var position: Double?

    enum CodingKeys: String, CodingKey {
        case title, description, priority, position
        case project_id, section_id, is_completed, completed_at, due_date
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        if let v = title { try container.encode(v, forKey: .title) }
        if let v = description { try container.encode(v, forKey: .description) }
        if let v = project_id { try container.encode(v, forKey: .project_id) }
        if let v = priority { try container.encode(v, forKey: .priority) }
        if let v = is_completed { try container.encode(v, forKey: .is_completed) }
        if let v = position { try container.encode(v, forKey: .position) }
        // Encode nullables explicitly when set
        if section_id != nil { try container.encode(section_id, forKey: .section_id) }
        if completed_at != nil || is_completed == false { try container.encode(completed_at, forKey: .completed_at) }
        if due_date != nil { try container.encode(due_date, forKey: .due_date) }
    }
}

struct TaskLabelInsert: Encodable {
    let task_id: String
    let label_id: String
}

final class TaskService {
    private var db: PostgrestClient { SupabaseService.shared.client.database }

    func fetchByProject(projectId: String) async throws -> [DoerTask] {
        let result: [TaskWithLabels] = try await db
            .from("tasks")
            .select("*, labels:task_labels(label_id, labels:labels(*))")
            .eq("project_id", value: projectId)
            .eq("is_completed", value: false)
            .order("position", ascending: true)
            .execute()
            .value
        return result.map { $0.toDoerTask() }
    }

    func fetchForToday() async throws -> [DoerTask] {
        let today = DateHelpers.todayString()
        let result: [TaskWithLabels] = try await db
            .from("tasks")
            .select("*, labels:task_labels(label_id, labels:labels(*)), project:projects(id, name, color)")
            .lte("due_date", value: today)
            .eq("is_completed", value: false)
            .is("parent_task_id", value: "null")
            .order("due_date", ascending: true)
            .order("priority", ascending: true)
            .execute()
            .value
        return result.map { $0.toDoerTask() }
    }

    func fetchForUpcoming() async throws -> [DoerTask] {
        let today = DateHelpers.todayString()
        let end = DateHelpers.dateString(daysFromNow: 7)
        let result: [TaskWithLabels] = try await db
            .from("tasks")
            .select("*, labels:task_labels(label_id, labels:labels(*)), project:projects(id, name, color)")
            .gte("due_date", value: today)
            .lte("due_date", value: end)
            .eq("is_completed", value: false)
            .is("parent_task_id", value: "null")
            .order("due_date", ascending: true)
            .order("priority", ascending: true)
            .execute()
            .value
        return result.map { $0.toDoerTask() }
    }

    func fetchSubTasks(parentId: String) async throws -> [DoerTask] {
        let result: [TaskWithLabels] = try await db
            .from("tasks")
            .select("*, labels:task_labels(label_id, labels:labels(*))")
            .eq("parent_task_id", value: parentId)
            .order("position", ascending: true)
            .execute()
            .value
        return result.map { $0.toDoerTask() }
    }

    func create(userId: String, title: String, projectId: String, sectionId: String? = nil,
                parentTaskId: String? = nil, priority: Int = 4, dueDate: String? = nil,
                position: Double = 65536) async throws -> DoerTask {
        let insert = TaskInsert(
            user_id: userId, title: title, description: "",
            project_id: projectId, section_id: sectionId,
            parent_task_id: parentTaskId, priority: priority,
            due_date: dueDate, position: position
        )
        return try await db
            .from("tasks")
            .insert(insert)
            .select()
            .single()
            .execute()
            .value
    }

    func update(id: String, fields: TaskUpdate) async throws {
        try await db
            .from("tasks")
            .update(fields)
            .eq("id", value: id)
            .execute()
    }

    func delete(id: String) async throws {
        try await db
            .from("tasks")
            .delete()
            .eq("id", value: id)
            .execute()
    }

    func toggleComplete(task: DoerTask) async throws {
        let newCompleted = !task.isCompleted
        let fields = TaskUpdate(
            is_completed: newCompleted,
            completed_at: newCompleted ? ISO8601DateFormatter().string(from: Date()) : nil
        )
        try await update(id: task.id, fields: fields)
    }

    func addLabel(taskId: String, labelId: String) async throws {
        try await db
            .from("task_labels")
            .insert(TaskLabelInsert(task_id: taskId, label_id: labelId))
            .execute()
    }

    func removeLabel(taskId: String, labelId: String) async throws {
        try await db
            .from("task_labels")
            .delete()
            .eq("task_id", value: taskId)
            .eq("label_id", value: labelId)
            .execute()
    }
}
