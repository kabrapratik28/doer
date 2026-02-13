import SwiftUI
import Supabase

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var isLoading = true
    @Published var isAuthenticated = false
    @Published var userId: String?
    @Published var profile: Profile?
    @Published var errorMessage: String?

    private let authService = AuthService()

    func checkSession() async {
        isLoading = true
        defer { isLoading = false }

        guard let user = await authService.getUser() else {
            isAuthenticated = false
            return
        }

        userId = user.id.uuidString
        isAuthenticated = true

        do {
            profile = try await authService.getProfile(userId: user.id.uuidString)
        } catch {
            print("Failed to load profile: \(error)")
        }
    }

    func signUp(email: String, password: String, fullName: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await authService.signUp(email: email, password: password, fullName: fullName)
            // After sign-up, sign in automatically
            try await authService.signIn(email: email, password: password)
            await checkSession()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await authService.signIn(email: email, password: password)
            await checkSession()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signOut() async {
        do {
            try await authService.signOut()
            isAuthenticated = false
            userId = nil
            profile = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateProfile(fullName: String) async {
        guard let userId else { return }
        do {
            try await authService.updateProfile(userId: userId, fullName: fullName, avatarUrl: profile?.avatarUrl ?? "")
            profile?.fullName = fullName
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updatePassword(newPassword: String) async {
        do {
            try await authService.updatePassword(newPassword: newPassword)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
