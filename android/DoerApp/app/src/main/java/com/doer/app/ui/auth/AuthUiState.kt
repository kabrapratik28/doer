package com.doer.app.ui.auth

import com.doer.app.data.model.Profile
import io.github.jan.supabase.auth.user.UserInfo

data class AuthUiState(
    val isLoading: Boolean = true,
    val isAuthenticated: Boolean = false,
    val user: UserInfo? = null,
    val profile: Profile? = null,
    val error: String? = null
)
