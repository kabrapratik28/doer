import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var authVM: AuthViewModel

    @State private var fullName: String = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var showPasswordSection = false
    @State private var showSavedAlert = false
    @State private var showPasswordSavedAlert = false
    @State private var passwordError: String?
    @State private var showLabelManager = false

    var body: some View {
        NavigationStack {
            Form {
                // Profile section
                Section("Profile") {
                    HStack(spacing: 14) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 44))
                            .foregroundColor(.doerRed)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(authVM.profile?.fullName ?? "User")
                                .font(.headline)
                            Text(authVM.profile?.email ?? "")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 4)

                    HStack {
                        Text("Full Name")
                        Spacer()
                        TextField("Full Name", text: $fullName)
                            .multilineTextAlignment(.trailing)
                            .foregroundColor(.secondary)
                    }

                    Button("Save Profile") {
                        Task {
                            await authVM.updateProfile(fullName: fullName)
                            showSavedAlert = true
                        }
                    }
                    .foregroundColor(.doerRed)
                    .disabled(fullName.trimmingCharacters(in: .whitespaces).isEmpty)
                }

                // Password section
                Section("Security") {
                    Button {
                        showPasswordSection.toggle()
                    } label: {
                        HStack {
                            Label("Change Password", systemImage: "lock")
                            Spacer()
                            Image(systemName: showPasswordSection ? "chevron.up" : "chevron.down")
                                .font(.caption)
                        }
                        .foregroundColor(.primary)
                    }

                    if showPasswordSection {
                        SecureField("New Password", text: $newPassword)
                        SecureField("Confirm Password", text: $confirmPassword)

                        if let error = passwordError {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                        }

                        Button("Update Password") {
                            guard newPassword.count >= 6 else {
                                passwordError = "Password must be at least 6 characters"
                                return
                            }
                            guard newPassword == confirmPassword else {
                                passwordError = "Passwords do not match"
                                return
                            }
                            passwordError = nil
                            Task {
                                await authVM.updatePassword(newPassword: newPassword)
                                newPassword = ""
                                confirmPassword = ""
                                showPasswordSection = false
                                showPasswordSavedAlert = true
                            }
                        }
                        .foregroundColor(.doerRed)
                    }
                }

                // Labels
                Section("Manage") {
                    Button {
                        showLabelManager = true
                    } label: {
                        HStack {
                            Label("Labels", systemImage: "tag")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .foregroundColor(.primary)
                    }
                }

                // Sign out
                Section {
                    Button(role: .destructive) {
                        Task { await authVM.signOut() }
                    } label: {
                        HStack {
                            Spacer()
                            Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                            Spacer()
                        }
                    }
                }

                // App info
                Section {
                    HStack {
                        Spacer()
                        VStack(spacing: 4) {
                            Text("Doer")
                                .font(.headline)
                                .foregroundColor(.doerRed)
                            Text("Version 1.0.0")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                    }
                    .listRowBackground(Color.clear)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                fullName = authVM.profile?.fullName ?? ""
            }
            .alert("Profile Saved", isPresented: $showSavedAlert) {
                Button("OK", role: .cancel) {}
            }
            .alert("Password Updated", isPresented: $showPasswordSavedAlert) {
                Button("OK", role: .cancel) {}
            }
            .sheet(isPresented: $showLabelManager) {
                LabelManagerSheet()
            }
        }
    }
}
