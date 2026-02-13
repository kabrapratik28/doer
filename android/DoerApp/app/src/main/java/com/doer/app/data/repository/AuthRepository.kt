package com.doer.app.data.repository

import com.doer.app.data.model.Profile
import com.doer.app.data.remote.SupabaseModule
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class AuthRepository {

    private val client = SupabaseModule.client

    suspend fun signUp(email: String, password: String, fullName: String) {
        client.auth.signUpWith(Email) {
            this.email = email
            this.password = password
            this.data = buildJsonObject {
                put("full_name", fullName)
            }
        }
    }

    suspend fun signIn(email: String, password: String) {
        client.auth.signInWith(Email) {
            this.email = email
            this.password = password
        }
    }

    suspend fun signOut() {
        client.auth.signOut()
    }

    fun getUser() = client.auth.currentUserOrNull()

    fun getSession() = client.auth.currentSessionOrNull()

    suspend fun getProfile(userId: String): Profile {
        return client.from("profiles")
            .select {
                filter {
                    eq("id", userId)
                }
            }
            .decodeSingle<Profile>()
    }

    suspend fun updateProfile(userId: String, fullName: String) {
        client.from("profiles")
            .update(buildJsonObject {
                put("full_name", fullName)
            }) {
                filter {
                    eq("id", userId)
                }
            }
    }

    suspend fun updatePassword(newPassword: String) {
        client.auth.updateUser {
            password = newPassword
        }
    }

    val sessionStatus get() = client.auth.sessionStatus
}
