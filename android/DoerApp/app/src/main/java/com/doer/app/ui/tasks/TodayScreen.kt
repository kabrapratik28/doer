package com.doer.app.ui.tasks

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TodayScreen(
    taskViewModel: TaskViewModel,
    onTaskClick: (String) -> Unit
) {
    val state by taskViewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        taskViewModel.fetchForToday()
    }

    PullToRefreshBox(
        isRefreshing = state.isLoading,
        onRefresh = { taskViewModel.fetchForToday() },
        modifier = Modifier.fillMaxSize()
    ) {
        if (!state.isLoading && state.overdueTasks.isEmpty() && state.todayTasks.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "All caught up!",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "No tasks due today",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                    )
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                // Overdue section
                if (state.overdueTasks.isNotEmpty()) {
                    item {
                        Text(
                            text = "Overdue",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFDC2626),
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }
                    items(
                        items = state.overdueTasks,
                        key = { "overdue_${it.id}" }
                    ) { taskWithLabels ->
                        TaskItem(
                            taskWithLabels = taskWithLabels,
                            onToggleComplete = { taskViewModel.toggleComplete(it) },
                            onDelete = { taskViewModel.deleteTask(it) },
                            onClick = onTaskClick
                        )
                    }
                }

                // Today section
                if (state.todayTasks.isNotEmpty()) {
                    item {
                        Text(
                            text = "Today",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }
                    items(
                        items = state.todayTasks,
                        key = { "today_${it.id}" }
                    ) { taskWithLabels ->
                        TaskItem(
                            taskWithLabels = taskWithLabels,
                            onToggleComplete = { taskViewModel.toggleComplete(it) },
                            onDelete = { taskViewModel.deleteTask(it) },
                            onClick = onTaskClick
                        )
                    }
                }
            }
        }
    }
}
