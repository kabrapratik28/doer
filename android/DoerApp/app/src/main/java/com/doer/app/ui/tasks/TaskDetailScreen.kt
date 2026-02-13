package com.doer.app.ui.tasks

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.doer.app.data.model.DoerLabel
import com.doer.app.data.model.DoerTask
import com.doer.app.data.model.Project
import com.doer.app.data.model.TaskWithLabels
import com.doer.app.ui.components.PriorityCheckbox
import com.doer.app.util.ColorHelpers
import com.doer.app.util.DateHelpers
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun TaskDetailScreen(
    taskWithLabels: TaskWithLabels?,
    projects: List<Project>,
    allLabels: List<DoerLabel>,
    onUpdateTask: (String, Map<String, Any?>) -> Unit,
    onToggleComplete: (DoerTask) -> Unit,
    onDeleteTask: (String) -> Unit,
    onAddLabel: (String, String) -> Unit,
    onRemoveLabel: (String, String) -> Unit,
    onBack: () -> Unit
) {
    if (taskWithLabels == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Task not found")
        }
        return
    }

    val task = taskWithLabels.toDoerTask()
    val taskLabels = taskWithLabels.extractLabels()

    var title by remember(task.id) { mutableStateOf(task.title) }
    var description by remember(task.id) { mutableStateOf(task.description) }
    var priority by remember(task.id) { mutableIntStateOf(task.priority) }
    var showDatePicker by remember { mutableStateOf(false) }
    var showProjectMenu by remember { mutableStateOf(false) }
    var selectedProjectId by remember(task.id) { mutableStateOf(task.projectId) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Task Details") },
                navigationIcon = {
                    IconButton(onClick = {
                        // Save changes on back
                        if (title != task.title || description != task.description ||
                            priority != task.priority || selectedProjectId != task.projectId
                        ) {
                            onUpdateTask(
                                task.id,
                                buildMap {
                                    if (title != task.title) put("title", title)
                                    if (description != task.description) put("description", description)
                                    if (priority != task.priority) put("priority", priority)
                                    if (selectedProjectId != task.projectId) put("project_id", selectedProjectId)
                                }
                            )
                        }
                        onBack()
                    }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = {
                        onDeleteTask(task.id)
                        onBack()
                    }) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = Color(0xFFDC2626)
                        )
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Priority + Completion
            Row(verticalAlignment = Alignment.CenterVertically) {
                PriorityCheckbox(
                    priority = priority,
                    isChecked = task.isCompleted,
                    onToggle = { onToggleComplete(task) }
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = if (task.isCompleted) "Completed" else "Incomplete",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Title
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Title") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Description
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
                maxLines = 6
            )

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider()
            Spacer(modifier = Modifier.height(16.dp))

            // Project picker
            Text("Project", style = MaterialTheme.typography.labelLarge)
            Spacer(modifier = Modifier.height(4.dp))
            Box {
                val selectedProject = projects.find { it.id == selectedProjectId }
                AssistChip(
                    onClick = { showProjectMenu = true },
                    label = {
                        Text(selectedProject?.name ?: "Select Project")
                    },
                    leadingIcon = {
                        if (selectedProject != null) {
                            Box(
                                modifier = Modifier
                                    .width(12.dp)
                                    .height(12.dp)
                                    .padding(0.dp),
                            )
                        }
                    }
                )
                DropdownMenu(
                    expanded = showProjectMenu,
                    onDismissRequest = { showProjectMenu = false }
                ) {
                    projects.forEach { project ->
                        DropdownMenuItem(
                            text = { Text(project.name) },
                            onClick = {
                                selectedProjectId = project.id
                                showProjectMenu = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Priority
            Text("Priority", style = MaterialTheme.typography.labelLarge)
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                (1..4).forEach { p ->
                    FilterChip(
                        selected = priority == p,
                        onClick = { priority = p },
                        label = { Text("P$p") },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Flag,
                                contentDescription = null,
                                tint = ColorHelpers.priorityColor(p)
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = ColorHelpers.priorityColor(p).copy(alpha = 0.15f)
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Due date
            Text("Due Date", style = MaterialTheme.typography.labelLarge)
            Spacer(modifier = Modifier.height(4.dp))
            AssistChip(
                onClick = { showDatePicker = true },
                label = {
                    Text(
                        text = task.dueDate?.let { DateHelpers.formatDueDate(it) } ?: "No due date",
                        color = DateHelpers.dueDateColor(task.dueDate)
                    )
                },
                leadingIcon = {
                    Icon(
                        Icons.Default.CalendarToday,
                        contentDescription = null,
                        tint = DateHelpers.dueDateColor(task.dueDate)
                    )
                }
            )

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider()
            Spacer(modifier = Modifier.height(16.dp))

            // Labels
            Text("Labels", style = MaterialTheme.typography.labelLarge)
            Spacer(modifier = Modifier.height(8.dp))

            val taskLabelIds = taskLabels.map { it.id }.toSet()

            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                allLabels.forEach { label ->
                    val isSelected = label.id in taskLabelIds
                    FilterChip(
                        selected = isSelected,
                        onClick = {
                            if (isSelected) {
                                onRemoveLabel(task.id, label.id)
                            } else {
                                onAddLabel(task.id, label.id)
                            }
                        },
                        label = { Text(label.name) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = ColorHelpers.parseHexColor(label.color).copy(alpha = 0.2f)
                        )
                    )
                }
            }
        }

        // Date Picker Dialog
        if (showDatePicker) {
            val datePickerState = rememberDatePickerState()
            DatePickerDialog(
                onDismissRequest = { showDatePicker = false },
                confirmButton = {
                    TextButton(onClick = {
                        datePickerState.selectedDateMillis?.let { millis ->
                            val date = Instant.ofEpochMilli(millis)
                                .atZone(ZoneId.systemDefault())
                                .toLocalDate()
                            val dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE)
                            onUpdateTask(task.id, mapOf("due_date" to dateStr))
                        }
                        showDatePicker = false
                    }) {
                        Text("OK")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showDatePicker = false }) {
                        Text("Cancel")
                    }
                }
            ) {
                DatePicker(state = datePickerState)
            }
        }
    }
}
