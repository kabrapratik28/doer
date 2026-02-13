package com.doer.app.ui.projects

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.doer.app.data.model.Project
import com.doer.app.data.model.ProjectSection
import com.doer.app.data.repository.ProjectRepository
import com.doer.app.util.PositionHelpers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ProjectUiState(
    val projects: List<Project> = emptyList(),
    val sections: List<ProjectSection> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class ProjectViewModel : ViewModel() {

    private val projectRepository = ProjectRepository()

    private val _uiState = MutableStateFlow(ProjectUiState())
    val uiState: StateFlow<ProjectUiState> = _uiState.asStateFlow()

    fun fetchAll(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val projects = projectRepository.fetchAll(userId)
                _uiState.update { it.copy(projects = projects, isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun createProject(userId: String, name: String, color: String) {
        viewModelScope.launch {
            try {
                val maxPos = _uiState.value.projects.maxOfOrNull { it.position } ?: 0.0
                val position = PositionHelpers.getPositionAtEnd(maxPos)
                projectRepository.create(userId, name, color, position)
                fetchAll(userId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun updateProject(id: String, name: String, color: String, userId: String) {
        viewModelScope.launch {
            try {
                projectRepository.update(id, name, color)
                fetchAll(userId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun deleteProject(id: String, userId: String) {
        viewModelScope.launch {
            try {
                projectRepository.delete(id)
                fetchAll(userId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun fetchSections(projectId: String) {
        viewModelScope.launch {
            try {
                val sections = projectRepository.fetchSections(projectId)
                _uiState.update { it.copy(sections = sections) }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun createSection(projectId: String, userId: String, name: String) {
        viewModelScope.launch {
            try {
                val maxPos = _uiState.value.sections.maxOfOrNull { it.position } ?: 0.0
                val position = PositionHelpers.getPositionAtEnd(maxPos)
                projectRepository.createSection(projectId, userId, name, position)
                fetchSections(projectId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun deleteSection(sectionId: String, projectId: String) {
        viewModelScope.launch {
            try {
                projectRepository.deleteSection(sectionId)
                fetchSections(projectId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }

    /**
     * Returns the inbox project for the given user, if one exists.
     */
    fun getInboxProject(): Project? {
        return _uiState.value.projects.find { it.isInbox }
    }
}
