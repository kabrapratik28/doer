package com.doer.app.ui.labels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.doer.app.data.model.DoerLabel
import com.doer.app.data.repository.LabelRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class LabelUiState(
    val labels: List<DoerLabel> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class LabelViewModel : ViewModel() {

    private val labelRepository = LabelRepository()

    private val _uiState = MutableStateFlow(LabelUiState())
    val uiState: StateFlow<LabelUiState> = _uiState.asStateFlow()

    fun fetchAll(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val labels = labelRepository.fetchAll(userId)
                _uiState.update { it.copy(labels = labels, isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun createLabel(userId: String, name: String, color: String) {
        viewModelScope.launch {
            try {
                labelRepository.create(userId, name, color)
                fetchAll(userId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun updateLabel(id: String, name: String, color: String, userId: String) {
        viewModelScope.launch {
            try {
                labelRepository.update(id, name, color)
                fetchAll(userId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun deleteLabel(id: String, userId: String) {
        viewModelScope.launch {
            try {
                labelRepository.delete(id)
                fetchAll(userId)
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
