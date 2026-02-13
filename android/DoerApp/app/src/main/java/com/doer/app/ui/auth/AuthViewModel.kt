package com.doer.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.doer.app.data.repository.AuthRepository
import io.github.jan.supabase.auth.status.SessionStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {

    private val authRepository = AuthRepository()

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        checkSession()
    }

    fun checkSession() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                authRepository.sessionStatus.collect { status ->
                    when (status) {
                        is SessionStatus.Authenticated -> {
                            val user = authRepository.getUser()
                            val profile = user?.id?.let { userId ->
                                try {
                                    authRepository.getProfile(userId)
                                } catch (e: Exception) {
                                    null
                                }
                            }
                            _uiState.update {
                                it.copy(
                                    isLoading = false,
                                    isAuthenticated = true,
                                    user = user,
                                    profile = profile,
                                    error = null
                                )
                            }
                        }
                        is SessionStatus.NotAuthenticated -> {
                            _uiState.update {
                                it.copy(
                                    isLoading = false,
                                    isAuthenticated = false,
                                    user = null,
                                    profile = null
                                )
                            }
                        }
                        is SessionStatus.Initializing -> {
                            _uiState.update { it.copy(isLoading = true) }
                        }
                        is SessionStatus.RefreshFailure -> {
                            _uiState.update {
                                it.copy(
                                    isLoading = false,
                                    isAuthenticated = false,
                                    error = "Session expired. Please sign in again."
                                )
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        isAuthenticated = false,
                        error = e.message
                    )
                }
            }
        }
    }

    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                authRepository.signIn(email, password)
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Sign in failed"
                    )
                }
            }
        }
    }

    fun signUp(email: String, password: String, fullName: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                authRepository.signUp(email, password, fullName)
                // After sign up, attempt sign in
                authRepository.signIn(email, password)
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Sign up failed"
                    )
                }
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                authRepository.signOut()
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Sign out failed"
                    )
                }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }

    fun refreshProfile() {
        viewModelScope.launch {
            try {
                val user = authRepository.getUser()
                val profile = user?.id?.let { authRepository.getProfile(it) }
                _uiState.update { it.copy(user = user, profile = profile) }
            } catch (e: Exception) {
                // Silently fail on profile refresh
            }
        }
    }

    fun updateProfile(fullName: String) {
        viewModelScope.launch {
            try {
                val userId = authRepository.getUser()?.id ?: return@launch
                authRepository.updateProfile(userId, fullName)
                refreshProfile()
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }

    fun updatePassword(newPassword: String) {
        viewModelScope.launch {
            try {
                authRepository.updatePassword(newPassword)
                _uiState.update { it.copy(error = null) }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message ?: "Password update failed") }
            }
        }
    }
}
