import Foundation
import Supabase

struct LabelInsert: Encodable {
    let user_id: String
    let name: String
    let color: String
}

struct LabelUpdate: Encodable {
    var name: String?
    var color: String?

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        if let v = name { try container.encode(v, forKey: .name) }
        if let v = color { try container.encode(v, forKey: .color) }
    }

    enum CodingKeys: String, CodingKey { case name, color }
}

final class LabelService {
    private var db: PostgrestClient { SupabaseService.shared.client.database }

    func fetchAll() async throws -> [DoerLabel] {
        try await db
            .from("labels")
            .select()
            .order("name", ascending: true)
            .execute()
            .value
    }

    func create(userId: String, name: String, color: String) async throws -> DoerLabel {
        try await db
            .from("labels")
            .insert(LabelInsert(user_id: userId, name: name, color: color))
            .select()
            .single()
            .execute()
            .value
    }

    func update(id: String, name: String?, color: String?) async throws {
        try await db
            .from("labels")
            .update(LabelUpdate(name: name, color: color))
            .eq("id", value: id)
            .execute()
    }

    func delete(id: String) async throws {
        try await db
            .from("labels")
            .delete()
            .eq("id", value: id)
            .execute()
    }
}
