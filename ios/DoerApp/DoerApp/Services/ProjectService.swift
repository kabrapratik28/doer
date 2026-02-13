import Foundation
import Supabase

struct ProjectInsert: Encodable {
    let user_id: String
    let name: String
    let color: String
    let position: Double
}

struct SectionInsert: Encodable {
    let user_id: String
    let project_id: String
    let name: String
    let position: Double
}

final class ProjectService {
    private var db: PostgrestClient { SupabaseService.shared.client.database }

    func fetchAll() async throws -> [Project] {
        try await db
            .from("projects")
            .select()
            .eq("is_archived", value: false)
            .order("position", ascending: true)
            .execute()
            .value
    }

    func create(userId: String, name: String, color: String, position: Double) async throws -> Project {
        try await db
            .from("projects")
            .insert(ProjectInsert(user_id: userId, name: name, color: color, position: position))
            .select()
            .single()
            .execute()
            .value
    }

    func update(id: String, name: String, color: String) async throws {
        struct ProjectUpdate: Encodable { let name: String; let color: String }
        try await db
            .from("projects")
            .update(ProjectUpdate(name: name, color: color))
            .eq("id", value: id)
            .execute()
    }

    func delete(id: String) async throws {
        try await db
            .from("projects")
            .delete()
            .eq("id", value: id)
            .execute()
    }

    func fetchSections(projectId: String) async throws -> [ProjectSection] {
        try await db
            .from("sections")
            .select()
            .eq("project_id", value: projectId)
            .order("position", ascending: true)
            .execute()
            .value
    }

    func createSection(userId: String, projectId: String, name: String, position: Double) async throws -> ProjectSection {
        try await db
            .from("sections")
            .insert(SectionInsert(user_id: userId, project_id: projectId, name: name, position: position))
            .select()
            .single()
            .execute()
            .value
    }

    func deleteSection(id: String) async throws {
        try await db
            .from("sections")
            .delete()
            .eq("id", value: id)
            .execute()
    }
}
