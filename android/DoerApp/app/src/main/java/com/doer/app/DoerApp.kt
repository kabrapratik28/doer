package com.doer.app

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.viewmodel.compose.viewModel
import com.doer.app.ui.auth.AuthViewModel
import com.doer.app.ui.auth.LoginScreen
import com.doer.app.ui.auth.SignupScreen
import com.doer.app.ui.main.MainScreen

private val DoerRed = Color(0xFFDC2626)
private val DoerRedDark = Color(0xFFEF4444)

private val DoerLightColorScheme = lightColorScheme(
    primary = DoerRed,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFEE2E2),
    onPrimaryContainer = Color(0xFF7F1D1D),
    secondary = Color(0xFF64748B),
    onSecondary = Color.White,
    background = Color(0xFFFAFAFA),
    onBackground = Color(0xFF1E293B),
    surface = Color.White,
    onSurface = Color(0xFF1E293B),
    surfaceVariant = Color(0xFFF1F5F9),
    onSurfaceVariant = Color(0xFF64748B),
    error = Color(0xFFDC2626),
    onError = Color.White
)

private val DoerDarkColorScheme = darkColorScheme(
    primary = DoerRedDark,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF7F1D1D),
    onPrimaryContainer = Color(0xFFFEE2E2),
    secondary = Color(0xFF94A3B8),
    onSecondary = Color.Black,
    background = Color(0xFF0F172A),
    onBackground = Color(0xFFE2E8F0),
    surface = Color(0xFF1E293B),
    onSurface = Color(0xFFE2E8F0),
    surfaceVariant = Color(0xFF334155),
    onSurfaceVariant = Color(0xFF94A3B8),
    error = Color(0xFFEF4444),
    onError = Color.White
)

@Composable
fun DoerApp() {
    val authViewModel: AuthViewModel = viewModel()
    val authState by authViewModel.uiState.collectAsState()

    MaterialTheme(
        colorScheme = DoerLightColorScheme
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            when {
                authState.isLoading && !authState.isAuthenticated -> {
                    // Loading state
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = DoerRed)
                    }
                }

                authState.isAuthenticated -> {
                    MainScreen(authViewModel = authViewModel)
                }

                else -> {
                    // Auth flow
                    var showSignUp by remember { mutableStateOf(false) }

                    if (showSignUp) {
                        SignupScreen(
                            isLoading = authState.isLoading,
                            error = authState.error,
                            onSignUp = { email, password, fullName ->
                                authViewModel.signUp(email, password, fullName)
                            },
                            onNavigateToLogin = { showSignUp = false }
                        )
                    } else {
                        LoginScreen(
                            isLoading = authState.isLoading,
                            error = authState.error,
                            onSignIn = { email, password ->
                                authViewModel.signIn(email, password)
                            },
                            onNavigateToSignUp = { showSignUp = true }
                        )
                    }
                }
            }
        }
    }
}
