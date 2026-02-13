package com.doer.app.ui.tasks

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.doer.app.data.model.DoerTask
import com.doer.app.data.model.TaskWithLabels

@Composable
fun TaskList(
    tasks: List<TaskWithLabels>,
    onToggleComplete: (DoerTask) -> Unit,
    onDelete: (String) -> Unit,
    onClick: (String) -> Unit,
    modifier: Modifier = Modifier,
    emptyMessage: String = "No tasks"
) {
    if (tasks.isEmpty()) {
        Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = emptyMessage,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    } else {
        LazyColumn(
            modifier = modifier,
            contentPadding = PaddingValues(vertical = 4.dp)
        ) {
            items(
                items = tasks,
                key = { it.id }
            ) { taskWithLabels ->
                TaskItem(
                    taskWithLabels = taskWithLabels,
                    onToggleComplete = onToggleComplete,
                    onDelete = onDelete,
                    onClick = onClick
                )
            }
        }
    }
}
