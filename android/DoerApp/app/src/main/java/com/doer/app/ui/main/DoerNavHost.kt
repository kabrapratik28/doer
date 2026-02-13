package com.doer.app.ui.main

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.doer.app.data.model.DoerLabel
import com.doer.app.data.model.Project
import com.doer.app.ui.auth.AuthViewModel
import com.doer.app.ui.labels.LabelViewModel
import com.doer.app.ui.projects.ProjectDetailScreen
import com.doer.app.ui.projects.ProjectListScreen
import com.doer.app.ui.projects.ProjectViewModel
import com.doer.app.ui.settings.SettingsScreen
import com.doer.app.ui.tasks.TaskDetailScreen
import com.doer.app.ui.tasks.TaskViewModel
import com.doer.app.ui.tasks.TodayScreen
import com.doer.app.ui.tasks.UpcomingScreen

object DoerRoutes {
    const val TODAY = "today"
    const val UPCOMING = "upcoming"
    const val INBOX = "inbox"
    const val PROJECTS = "projects"
    const val PROJECT_DETAIL = "project/{projectId}"
    const val TASK_DETAIL = "task/{taskId}"
    const val SETTINGS = "settings"

    fun projectDetail(projectId: String) = "project/$projectId"
    fun taskDetail(taskId: String) = "task/$taskId"
}

@Composable
fun DoerNavHost(
    navController: NavHostController,
    userId: String,
    inboxProjectId: String?,
    projects: List<Project>,
    allLabels: List<DoerLabel>,
    authViewModel: AuthViewModel,
    taskViewModel: TaskViewModel,
    projectViewModel: ProjectViewModel,
    labelViewModel: LabelViewModel,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = DoerRoutes.TODAY,
        modifier = modifier
    ) {
        composable(DoerRoutes.TODAY) {
            TodayScreen(
                taskViewModel = taskViewModel,
                onTaskClick = { taskId ->
                    navController.navigate(DoerRoutes.taskDetail(taskId))
                }
            )
        }

        composable(DoerRoutes.UPCOMING) {
            UpcomingScreen(
                taskViewModel = taskViewModel,
                onTaskClick = { taskId ->
                    navController.navigate(DoerRoutes.taskDetail(taskId))
                }
            )
        }

        composable(DoerRoutes.INBOX) {
            if (inboxProjectId != null) {
                ProjectDetailScreen(
                    projectId = inboxProjectId,
                    userId = userId,
                    projectViewModel = projectViewModel,
                    taskViewModel = taskViewModel,
                    onTaskClick = { taskId ->
                        navController.navigate(DoerRoutes.taskDetail(taskId))
                    },
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(DoerRoutes.PROJECTS) {
            ProjectListScreen(
                projectViewModel = projectViewModel,
                userId = userId,
                onProjectClick = { projectId ->
                    navController.navigate(DoerRoutes.projectDetail(projectId))
                }
            )
        }

        composable(
            route = DoerRoutes.PROJECT_DETAIL,
            arguments = listOf(navArgument("projectId") { type = NavType.StringType })
        ) { backStackEntry ->
            val projectId = backStackEntry.arguments?.getString("projectId") ?: return@composable
            ProjectDetailScreen(
                projectId = projectId,
                userId = userId,
                projectViewModel = projectViewModel,
                taskViewModel = taskViewModel,
                onTaskClick = { taskId ->
                    navController.navigate(DoerRoutes.taskDetail(taskId))
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = DoerRoutes.TASK_DETAIL,
            arguments = listOf(navArgument("taskId") { type = NavType.StringType })
        ) { backStackEntry ->
            val taskId = backStackEntry.arguments?.getString("taskId") ?: return@composable
            val taskState = taskViewModel.uiState.value
            // Find the task across all task lists
            val taskWithLabels = taskState.tasks.find { it.id == taskId }
                ?: taskState.todayTasks.find { it.id == taskId }
                ?: taskState.overdueTasks.find { it.id == taskId }
                ?: taskState.upcomingByDay.values.flatten().find { it.id == taskId }

            TaskDetailScreen(
                taskWithLabels = taskWithLabels,
                projects = projects,
                allLabels = allLabels,
                onUpdateTask = { id, fields -> taskViewModel.updateTask(id, fields) },
                onToggleComplete = { taskViewModel.toggleComplete(it) },
                onDeleteTask = { taskViewModel.deleteTask(it) },
                onAddLabel = { tId, lId -> taskViewModel.addLabel(tId, lId) },
                onRemoveLabel = { tId, lId -> taskViewModel.removeLabel(tId, lId) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(DoerRoutes.SETTINGS) {
            SettingsScreen(
                authViewModel = authViewModel,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
