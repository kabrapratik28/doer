package com.doer.app.ui.tasks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.doer.app.data.model.DoerTask
import com.doer.app.data.model.TaskWithLabels
import com.doer.app.data.repository.TaskRepository
import com.doer.app.util.DateHelpers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class TaskUiState(
    val tasks: List<TaskWithLabels> = emptyList(),
    val todayTasks: List<TaskWithLabels> = emptyList(),
    val overdueTasks: List<TaskWithLabels> = emptyList(),
    val upcomingByDay: Map<String, List<TaskWithLabels>> = emptyMap(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class TaskViewModel : ViewModel() {

    private val taskRepository = TaskRepository()

    private val _uiState = MutableStateFlow(TaskUiState())
    val uiState: StateFlow<TaskUiState> = _uiState.asStateFlow()

    fun fetchByProject(projectId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val tasks = taskRepository.fetchByProject(projectId)
                _uiState.update { it.copy(tasks = tasks, isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun fetchForToday() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val all = taskRepository.fetchForToday()
                val today = DateHelpers.todayString()
                val overdue = all.filter { DateHelpers.isOverdue(it.dueDate) }
                val todayOnly = all.filter { it.dueDate?.take(10) == today }
                _uiState.update {
                    it.copy(
                        todayTasks = todayOnly,
                        overdueTasks = overdue,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun fetchForUpcoming() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val tasks = taskRepository.fetchForUpcoming()
                val grouped = tasks.groupBy { it.dueDate?.take(10) ?: "No date" }
                    .toSortedMap()
                _uiState.update {
                    it.copy(upcomingByDay = grouped, isLoading = false)
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun createTask(
        userId: String,
        title: String,
        projectId: String,
        sectionId: String? = null,
        priority: Int = 4,
        dueDate: String? = null
    ) {
        viewModelScope.launch {
            try {
                val currentTasks = _uiState.value.tasks
                val maxPosition = currentTasks.maxOfOrNull { it.position } ?: 0.0
                taskRepository.create(
                    userId = userId,
                    title = title,
                    projectId = projectId,
                    sectionId = sectionId,
                    priority = priority,
                    dueDate = dueDate,
                    position = maxPosition + 65536.0
                )
                // Refresh whichever view is active
                fetchByProject(projectId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun toggleComplete(task: DoerTask) {
        viewModelScope.launch {
            try {
                taskRepository.toggleComplete(task)
                // Remove from current list optimistically
                _uiState.update { state ->
                    state.copy(
                        tasks = state.tasks.filter { it.id != task.id },
                        todayTasks = state.todayTasks.filter { it.id != task.id },
                        overdueTasks = state.overdueTasks.filter { it.id != task.id },
                        upcomingByDay = state.upcomingByDay.mapValues { (_, v) ->
                            v.filter { it.id != task.id }
                        }.filterValues { it.isNotEmpty() }
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun deleteTask(taskId: String) {
        viewModelScope.launch {
            try {
                taskRepository.delete(taskId)
                _uiState.update { state ->
                    state.copy(
                        tasks = state.tasks.filter { it.id != taskId },
                        todayTasks = state.todayTasks.filter { it.id != taskId },
                        overdueTasks = state.overdueTasks.filter { it.id != taskId },
                        upcomingByDay = state.upcomingByDay.mapValues { (_, v) ->
                            v.filter { it.id != taskId }
                        }.filterValues { it.isNotEmpty() }
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun updateTask(taskId: String, fields: Map<String, Any?>) {
        viewModelScope.launch {
            try {
                taskRepository.update(taskId, fields)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun addLabel(taskId: String, labelId: String) {
        viewModelScope.launch {
            try {
                taskRepository.addLabel(taskId, labelId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun removeLabel(taskId: String, labelId: String) {
        viewModelScope.launch {
            try {
                taskRepository.removeLabel(taskId, labelId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
