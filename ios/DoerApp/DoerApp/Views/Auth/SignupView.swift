import SwiftUI

struct SignupView: View {
    @EnvironmentObject private var authVM: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var fullName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var localError: String?

    private var formIsValid: Bool {
        !fullName.isEmpty && !email.isEmpty && !password.isEmpty && password == confirmPassword && password.count >= 6
    }

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Header
            VStack(spacing: 8) {
                Image(systemName: "person.badge.plus")
                    .font(.system(size: 48))
                    .foregroundColor(.doerRed)

                Text("Create Account")
                    .font(.title.bold())

                Text("Start getting things done")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            // Form
            VStack(spacing: 16) {
                TextField("Full Name", text: $fullName)
                    .textContentType(.name)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                TextField("Email", text: $email)
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                SecureField("Password", text: $password)
                    .textContentType(.newPassword)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                SecureField("Confirm Password", text: $confirmPassword)
                    .textContentType(.newPassword)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                if let error = localError ?? authVM.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                Button {
                    guard password == confirmPassword else {
                        localError = "Passwords do not match"
                        return
                    }
                    guard password.count >= 6 else {
                        localError = "Password must be at least 6 characters"
                        return
                    }
                    localError = nil
                    Task {
                        await authVM.signUp(email: email, password: password, fullName: fullName)
                    }
                } label: {
                    Group {
                        if authVM.isLoading {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Text("Create Account")
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.doerRed)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(!formIsValid || authVM.isLoading)
                .opacity(formIsValid ? 1 : 0.6)
            }
            .padding(.horizontal, 24)

            Spacer()

            HStack(spacing: 4) {
                Text("Already have an account?")
                    .foregroundColor(.secondary)
                Button("Sign In") {
                    dismiss()
                }
                .foregroundColor(.doerRed)
                .fontWeight(.semibold)
            }
            .font(.subheadline)
            .padding(.bottom, 24)
        }
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.doerRed)
                }
            }
        }
    }
}
