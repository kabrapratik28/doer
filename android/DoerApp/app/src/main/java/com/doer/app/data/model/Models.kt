package com.doer.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Profile(
    val id: String = "",
    val email: String = "",
    @SerialName("full_name")
    val fullName: String = "",
    @SerialName("avatar_url")
    val avatarUrl: String? = null,
    @SerialName("created_at")
    val createdAt: String = "",
    @SerialName("updated_at")
    val updatedAt: String = ""
)

@Serializable
data class Project(
    val id: String = "",
    @SerialName("user_id")
    val userId: String = "",
    val name: String = "",
    val color: String = "#dc2626",
    @SerialName("is_inbox")
    val isInbox: Boolean = false,
    @SerialName("is_archived")
    val isArchived: Boolean = false,
    val position: Double = 0.0,
    @SerialName("created_at")
    val createdAt: String = "",
    @SerialName("updated_at")
    val updatedAt: String = ""
)

@Serializable
data class ProjectSection(
    val id: String = "",
    @SerialName("project_id")
    val projectId: String = "",
    @SerialName("user_id")
    val userId: String = "",
    val name: String = "",
    val position: Double = 0.0,
    @SerialName("is_collapsed")
    val isCollapsed: Boolean = false,
    @SerialName("created_at")
    val createdAt: String = "",
    @SerialName("updated_at")
    val updatedAt: String = ""
)

@Serializable
data class DoerTask(
    val id: String = "",
    @SerialName("user_id")
    val userId: String = "",
    @SerialName("project_id")
    val projectId: String = "",
    @SerialName("section_id")
    val sectionId: String? = null,
    @SerialName("parent_task_id")
    val parentTaskId: String? = null,
    val title: String = "",
    val description: String = "",
    val priority: Int = 4,
    @SerialName("is_completed")
    val isCompleted: Boolean = false,
    @SerialName("completed_at")
    val completedAt: String? = null,
    @SerialName("due_date")
    val dueDate: String? = null,
    val position: Double = 0.0,
    @SerialName("created_at")
    val createdAt: String = "",
    @SerialName("updated_at")
    val updatedAt: String = ""
)

@Serializable
data class DoerLabel(
    val id: String = "",
    @SerialName("user_id")
    val userId: String = "",
    val name: String = "",
    val color: String = "#dc2626",
    @SerialName("created_at")
    val createdAt: String = ""
)

@Serializable
data class TaskLabelJoin(
    @SerialName("task_id")
    val taskId: String = "",
    @SerialName("label_id")
    val labelId: String = "",
    val labels: DoerLabel? = null
)

@Serializable
data class ProjectRef(
    val id: String = "",
    val name: String = "",
    val color: String = "#dc2626"
)

@Serializable
data class TaskWithLabels(
    val id: String = "",
    @SerialName("user_id")
    val userId: String = "",
    @SerialName("project_id")
    val projectId: String = "",
    @SerialName("section_id")
    val sectionId: String? = null,
    @SerialName("parent_task_id")
    val parentTaskId: String? = null,
    val title: String = "",
    val description: String = "",
    val priority: Int = 4,
    @SerialName("is_completed")
    val isCompleted: Boolean = false,
    @SerialName("completed_at")
    val completedAt: String? = null,
    @SerialName("due_date")
    val dueDate: String? = null,
    val position: Double = 0.0,
    @SerialName("created_at")
    val createdAt: String = "",
    @SerialName("updated_at")
    val updatedAt: String = "",
    @SerialName("task_labels")
    val taskLabels: List<TaskLabelJoin> = emptyList()
) {
    fun toDoerTask(): DoerTask = DoerTask(
        id = id,
        userId = userId,
        projectId = projectId,
        sectionId = sectionId,
        parentTaskId = parentTaskId,
        title = title,
        description = description,
        priority = priority,
        isCompleted = isCompleted,
        completedAt = completedAt,
        dueDate = dueDate,
        position = position,
        createdAt = createdAt,
        updatedAt = updatedAt
    )

    fun extractLabels(): List<DoerLabel> =
        taskLabels.mapNotNull { it.labels }
}
