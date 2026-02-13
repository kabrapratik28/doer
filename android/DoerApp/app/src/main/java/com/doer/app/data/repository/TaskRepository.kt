package com.doer.app.data.repository

import com.doer.app.data.model.DoerTask
import com.doer.app.data.model.TaskWithLabels
import com.doer.app.data.remote.SupabaseModule
import com.doer.app.util.DateHelpers
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class TaskRepository {

    private val client = SupabaseModule.client

    suspend fun fetchByProject(projectId: String): List<TaskWithLabels> {
        return client.from("tasks")
            .select(columns = Columns.raw("*, task_labels(*, labels(*))")) {
                filter {
                    eq("project_id", projectId)
                    eq("is_completed", false)
                }
                order(column = "position", order = Order.ASCENDING)
            }
            .decodeList<TaskWithLabels>()
    }

    suspend fun fetchForToday(): List<TaskWithLabels> {
        val today = DateHelpers.todayString()
        return client.from("tasks")
            .select(columns = Columns.raw("*, task_labels(*, labels(*))")) {
                filter {
                    eq("is_completed", false)
                    lte("due_date", today)
                }
                order(column = "due_date", order = Order.ASCENDING)
                order(column = "priority", order = Order.ASCENDING)
            }
            .decodeList<TaskWithLabels>()
    }

    suspend fun fetchForUpcoming(): List<TaskWithLabels> {
        val today = DateHelpers.todayString()
        val nextWeek = DateHelpers.dateString(daysFromNow = 7)
        return client.from("tasks")
            .select(columns = Columns.raw("*, task_labels(*, labels(*))")) {
                filter {
                    eq("is_completed", false)
                    gt("due_date", today)
                    lte("due_date", nextWeek)
                }
                order(column = "due_date", order = Order.ASCENDING)
                order(column = "priority", order = Order.ASCENDING)
            }
            .decodeList<TaskWithLabels>()
    }

    suspend fun create(
        userId: String,
        title: String,
        projectId: String,
        sectionId: String? = null,
        priority: Int = 4,
        dueDate: String? = null,
        position: Double = 0.0
    ): DoerTask {
        return client.from("tasks")
            .insert(buildJsonObject {
                put("user_id", userId)
                put("title", title)
                put("project_id", projectId)
                if (sectionId != null) put("section_id", sectionId)
                put("priority", priority)
                if (dueDate != null) put("due_date", dueDate)
                put("position", position)
            }) {
                select()
            }
            .decodeSingle<DoerTask>()
    }

    suspend fun update(id: String, fields: Map<String, Any?>) {
        client.from("tasks")
            .update(buildJsonObject {
                fields.forEach { (key, value) ->
                    when (value) {
                        is String -> put(key, value)
                        is Int -> put(key, value)
                        is Double -> put(key, value)
                        is Boolean -> put(key, value)
                        null -> put(key, null as String?)
                        else -> put(key, value.toString())
                    }
                }
            }) {
                filter {
                    eq("id", id)
                }
            }
    }

    suspend fun delete(id: String) {
        client.from("tasks")
            .delete {
                filter {
                    eq("id", id)
                }
            }
    }

    suspend fun toggleComplete(task: DoerTask) {
        val nowCompleted = !task.isCompleted
        client.from("tasks")
            .update(buildJsonObject {
                put("is_completed", nowCompleted)
                if (nowCompleted) {
                    put("completed_at", DateHelpers.todayString() + "T00:00:00Z")
                } else {
                    put("completed_at", null as String?)
                }
            }) {
                filter {
                    eq("id", task.id)
                }
            }
    }

    suspend fun addLabel(taskId: String, labelId: String) {
        client.from("task_labels")
            .insert(buildJsonObject {
                put("task_id", taskId)
                put("label_id", labelId)
            })
    }

    suspend fun removeLabel(taskId: String, labelId: String) {
        client.from("task_labels")
            .delete {
                filter {
                    eq("task_id", taskId)
                    eq("label_id", labelId)
                }
            }
    }
}
