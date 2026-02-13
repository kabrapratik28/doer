package com.doer.app.ui.projects

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.doer.app.data.model.ProjectSection
import com.doer.app.ui.tasks.TaskItem
import com.doer.app.ui.tasks.TaskViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectDetailScreen(
    projectId: String,
    userId: String,
    projectViewModel: ProjectViewModel,
    taskViewModel: TaskViewModel,
    onTaskClick: (String) -> Unit,
    onBack: () -> Unit
) {
    val projectState by projectViewModel.uiState.collectAsState()
    val taskState by taskViewModel.uiState.collectAsState()

    val project = projectState.projects.find { it.id == projectId }

    var showMenu by remember { mutableStateOf(false) }
    var showEditDialog by remember { mutableStateOf(false) }
    var showAddTask by remember { mutableStateOf(false) }
    var newTaskTitle by remember { mutableStateOf("") }
    var showAddSection by remember { mutableStateOf(false) }
    var newSectionName by remember { mutableStateOf("") }
    var addTaskSectionId by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(projectId) {
        taskViewModel.fetchByProject(projectId)
        projectViewModel.fetchSections(projectId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(project?.name ?: "Project") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = {
                        showAddTask = true
                        addTaskSectionId = null
                    }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Task")
                    }
                    Box {
                        IconButton(onClick = { showMenu = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "More")
                        }
                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Edit Project") },
                                leadingIcon = { Icon(Icons.Default.Edit, null) },
                                onClick = {
                                    showMenu = false
                                    showEditDialog = true
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("Add Section") },
                                leadingIcon = { Icon(Icons.Default.Add, null) },
                                onClick = {
                                    showMenu = false
                                    showAddSection = true
                                }
                            )
                            if (project?.isInbox == false) {
                                DropdownMenuItem(
                                    text = { Text("Delete Project", color = Color(0xFFDC2626)) },
                                    leadingIcon = {
                                        Icon(
                                            Icons.Default.Delete, null,
                                            tint = Color(0xFFDC2626)
                                        )
                                    },
                                    onClick = {
                                        showMenu = false
                                        projectViewModel.deleteProject(projectId, userId)
                                        onBack()
                                    }
                                )
                            }
                        }
                    }
                }
            )
        }
    ) { padding ->
        val tasks = taskState.tasks
        val sections = projectState.sections
        val unsectionedTasks = tasks.filter { it.sectionId == null }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(vertical = 4.dp)
        ) {
            // Inline add task
            if (showAddTask && addTaskSectionId == null) {
                item {
                    InlineAddTask(
                        value = newTaskTitle,
                        onValueChange = { newTaskTitle = it },
                        onSubmit = {
                            if (newTaskTitle.isNotBlank()) {
                                taskViewModel.createTask(
                                    userId = userId,
                                    title = newTaskTitle.trim(),
                                    projectId = projectId
                                )
                                newTaskTitle = ""
                                showAddTask = false
                            }
                        },
                        onCancel = {
                            newTaskTitle = ""
                            showAddTask = false
                        }
                    )
                }
            }

            // Unsectioned tasks
            items(
                items = unsectionedTasks,
                key = { "task_${it.id}" }
            ) { taskWithLabels ->
                TaskItem(
                    taskWithLabels = taskWithLabels,
                    onToggleComplete = { taskViewModel.toggleComplete(it) },
                    onDelete = { taskViewModel.deleteTask(it) },
                    onClick = onTaskClick
                )
            }

            // Sections
            sections.forEach { section ->
                item(key = "section_header_${section.id}") {
                    SectionHeader(
                        section = section,
                        onAddTask = {
                            showAddTask = true
                            addTaskSectionId = section.id
                        },
                        onDelete = {
                            projectViewModel.deleteSection(section.id, projectId)
                        }
                    )
                }

                // Inline add task for this section
                if (showAddTask && addTaskSectionId == section.id) {
                    item(key = "add_task_section_${section.id}") {
                        InlineAddTask(
                            value = newTaskTitle,
                            onValueChange = { newTaskTitle = it },
                            onSubmit = {
                                if (newTaskTitle.isNotBlank()) {
                                    taskViewModel.createTask(
                                        userId = userId,
                                        title = newTaskTitle.trim(),
                                        projectId = projectId,
                                        sectionId = section.id
                                    )
                                    newTaskTitle = ""
                                    showAddTask = false
                                }
                            },
                            onCancel = {
                                newTaskTitle = ""
                                showAddTask = false
                                addTaskSectionId = null
                            }
                        )
                    }
                }

                val sectionTasks = tasks.filter { it.sectionId == section.id }
                items(
                    items = sectionTasks,
                    key = { "task_${it.id}" }
                ) { taskWithLabels ->
                    TaskItem(
                        taskWithLabels = taskWithLabels,
                        onToggleComplete = { taskViewModel.toggleComplete(it) },
                        onDelete = { taskViewModel.deleteTask(it) },
                        onClick = onTaskClick
                    )
                }
            }

            // Add section inline
            if (showAddSection) {
                item(key = "add_section") {
                    InlineAddSection(
                        value = newSectionName,
                        onValueChange = { newSectionName = it },
                        onSubmit = {
                            if (newSectionName.isNotBlank()) {
                                projectViewModel.createSection(projectId, userId, newSectionName.trim())
                                newSectionName = ""
                                showAddSection = false
                            }
                        },
                        onCancel = {
                            newSectionName = ""
                            showAddSection = false
                        }
                    )
                }
            }
        }
    }

    if (showEditDialog && project != null) {
        ProjectFormDialog(
            existingProject = project,
            onDismiss = { showEditDialog = false },
            onSave = { name, color ->
                projectViewModel.updateProject(projectId, name, color, userId)
                showEditDialog = false
            }
        )
    }
}

@Composable
private fun SectionHeader(
    section: ProjectSection,
    onAddTask: () -> Unit,
    onDelete: () -> Unit
) {
    Column {
        HorizontalDivider()
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = section.name,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )
            Row {
                IconButton(onClick = onAddTask) {
                    Icon(
                        Icons.Default.Add,
                        contentDescription = "Add task to section",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete section",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun InlineAddTask(
    value: String,
    onValueChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onCancel: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text("Task name") },
            modifier = Modifier.weight(1f),
            singleLine = true
        )
        Spacer(modifier = Modifier.width(8.dp))
        IconButton(onClick = onSubmit) {
            Icon(Icons.Default.Send, contentDescription = "Add", tint = Color(0xFFDC2626))
        }
        IconButton(onClick = onCancel) {
            Icon(Icons.Default.Close, contentDescription = "Cancel")
        }
    }
}

@Composable
private fun InlineAddSection(
    value: String,
    onValueChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onCancel: () -> Unit
) {
    Column {
        HorizontalDivider()
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = value,
                onValueChange = onValueChange,
                placeholder = { Text("Section name") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            TextButton(onClick = onSubmit) {
                Text("Add", color = Color(0xFFDC2626))
            }
            TextButton(onClick = onCancel) {
                Text("Cancel")
            }
        }
    }
}
