import Foundation
import Supabase

final class AuthService {
    private var client: SupabaseClient { SupabaseService.shared.client }

    func signUp(email: String, password: String, fullName: String) async throws {
        try await client.auth.signUp(
            email: email,
            password: password,
            data: ["full_name": .string(fullName)]
        )
    }

    func signIn(email: String, password: String) async throws {
        try await client.auth.signIn(email: email, password: password)
    }

    func signOut() async throws {
        try await client.auth.signOut()
    }

    func getUser() async -> User? {
        try? await client.auth.session.user
    }

    func getProfile(userId: String) async throws -> Profile {
        try await client.database
            .from("profiles")
            .select()
            .eq("id", value: userId)
            .single()
            .execute()
            .value
    }

    func updateProfile(userId: String, fullName: String, avatarUrl: String) async throws {
        struct ProfileUpdate: Encodable {
            let full_name: String
            let avatar_url: String
        }
        try await client.database
            .from("profiles")
            .update(ProfileUpdate(full_name: fullName, avatar_url: avatarUrl))
            .eq("id", value: userId)
            .execute()
    }

    func updatePassword(newPassword: String) async throws {
        try await client.auth.update(user: .init(password: newPassword))
    }
}
