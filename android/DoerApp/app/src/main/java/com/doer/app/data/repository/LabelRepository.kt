package com.doer.app.data.repository

import com.doer.app.data.model.DoerLabel
import com.doer.app.data.remote.SupabaseModule
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class LabelRepository {

    private val client = SupabaseModule.client

    suspend fun fetchAll(userId: String): List<DoerLabel> {
        return client.from("labels")
            .select {
                filter {
                    eq("user_id", userId)
                }
                order(column = "name", order = Order.ASCENDING)
            }
            .decodeList<DoerLabel>()
    }

    suspend fun create(userId: String, name: String, color: String): DoerLabel {
        return client.from("labels")
            .insert(buildJsonObject {
                put("user_id", userId)
                put("name", name)
                put("color", color)
            }) {
                select()
            }
            .decodeSingle<DoerLabel>()
    }

    suspend fun update(id: String, name: String, color: String) {
        client.from("labels")
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
        client.from("labels")
            .delete {
                filter {
                    eq("id", id)
                }
            }
    }
}
