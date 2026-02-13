package com.doer.app.data.repository

import com.doer.app.data.model.Project
import com.doer.app.data.model.ProjectSection
import com.doer.app.data.remote.SupabaseModule
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class ProjectRepository {

    private val client = SupabaseModule.client

    suspend fun fetchAll(userId: String): List<Project> {
        return client.from("projects")
            .select {
                filter {
                    eq("user_id", userId)
                }
                order(column = "position", order = Order.ASCENDING)
            }
            .decodeList<Project>()
    }

    suspend fun create(userId: String, name: String, color: String, position: Double): Project {
        return client.from("projects")
            .insert(buildJsonObject {
                put("user_id", userId)
                put("name", name)
                put("color", color)
                put("position", position)
            }) {
                select()
            }
            .decodeSingle<Project>()
    }

    suspend fun update(id: String, name: String, color: String) {
        client.from("projects")
            .update(buildJsonObject {
                put("name", name)
                put("color", color)
            }) {
                filter {
                    eq("id", id)
                }
            }
    }

    suspend fun delete(id: String) {
        client.from("projects")
            .delete {
                filter {
                    eq("id", id)
                }
            }
    }

    suspend fun fetchSections(projectId: String): List<ProjectSection> {
        return client.from("sections")
            .select {
                filter {
                    eq("project_id", projectId)
                }
                order(column = "position", order = Order.ASCENDING)
            }
            .decodeList<ProjectSection>()
    }

    suspend fun createSection(
        projectId: String,
        userId: String,
        name: String,
        position: Double
    ): ProjectSection {
        return client.from("sections")
            .insert(buildJsonObject {
                put("project_id", projectId)
                put("user_id", userId)
                put("name", name)
                put("position", position)
            }) {
                select()
            }
            .decodeSingle<ProjectSection>()
    }

    suspend fun deleteSection(id: String) {
        client.from("sections")
            .delete {
                filter {
                    eq("id", id)
                }
            }
    }
}
