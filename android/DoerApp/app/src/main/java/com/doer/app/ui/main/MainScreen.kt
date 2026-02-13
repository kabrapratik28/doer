package com.doer.app.ui.main

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Today
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Folder
import androidx.compose.material.icons.outlined.Inbox
import androidx.compose.material.icons.outlined.Today
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.doer.app.ui.auth.AuthViewModel
import com.doer.app.ui.labels.LabelManagerSheet
import com.doer.app.ui.labels.LabelViewModel
import com.doer.app.ui.projects.ProjectViewModel
import com.doer.app.ui.tasks.TaskViewModel

data class BottomNavItem(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    authViewModel: AuthViewModel
) {
    val navController = rememberNavController()
    val taskViewModel: TaskViewModel = viewModel()
    val projectViewModel: ProjectViewModel = viewModel()
    val labelViewModel: LabelViewModel = viewModel()

    val authState by authViewModel.uiState.collectAsState()
    val projectState by projectViewModel.uiState.collectAsState()
    val labelState by labelViewModel.uiState.collectAsState()

    val userId = authState.user?.id ?: ""

    var showQuickAdd by remember { mutableStateOf(false) }
    var showLabels by remember { mutableStateOf(false) }

    // Fetch data on launch
    LaunchedEffect(userId) {
        if (userId.isNotEmpty()) {
            projectViewModel.fetchAll(userId)
            labelViewModel.fetchAll(userId)
        }
    }

    val inboxProject = projectState.projects.find { it.isInbox }

    val navItems = listOf(
        BottomNavItem(DoerRoutes.TODAY, "Today", Icons.Filled.Today, Icons.Outlined.Today),
        BottomNavItem(DoerRoutes.UPCOMING, "Upcoming", Icons.Filled.CalendarMonth, Icons.Outlined.CalendarMonth),
        BottomNavItem(DoerRoutes.INBOX, "Inbox", Icons.Filled.Inbox, Icons.Outlined.Inbox),
        BottomNavItem(DoerRoutes.PROJECTS, "Projects", Icons.Filled.Folder, Icons.Outlined.Folder)
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Determine which tab is selected
    var selectedTab by rememberSaveable { mutableIntStateOf(0) }

    LaunchedEffect(currentRoute) {
        val idx = navItems.indexOfFirst { it.route == currentRoute }
        if (idx >= 0) selectedTab = idx
    }

    val currentTitle = when {
        currentRoute == DoerRoutes.SETTINGS -> "Settings"
        currentRoute?.startsWith("project/") == true -> {
            val projectId = currentRoute.removePrefix("project/")
            projectState.projects.find { it.id == projectId }?.name ?: "Project"
        }
        currentRoute?.startsWith("task/") == true -> "Task"
        selectedTab < navItems.size -> navItems[selectedTab].title
        else -> "Doer"
    }

    val showBottomBar = currentRoute in navItems.map { it.route }

    Scaffold(
        topBar = {
            if (showBottomBar) {
                TopAppBar(
                    title = {
                        Text(
                            text = currentTitle,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    actions = {
                        IconButton(onClick = {
                            navController.navigate(DoerRoutes.SETTINGS)
                        }) {
                            Icon(
                                Icons.Default.Settings,
                                contentDescription = "Settings"
                            )
                        }
                    }
                )
            }
        },
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    navItems.forEachIndexed { index, item ->
                        NavigationBarItem(
                            selected = selectedTab == index,
                            onClick = {
                                selectedTab = index
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.startDestinationId) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = if (selectedTab == index) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.title
                                )
                            },
                            label = { Text(item.title) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFFDC2626),
                                selectedTextColor = Color(0xFFDC2626),
                                indicatorColor = Color(0xFFDC2626).copy(alpha = 0.1f)
                            )
                        )
                    }
                }
            }
        },
        floatingActionButton = {
            if (showBottomBar) {
                FloatingActionButton(
                    onClick = { showQuickAdd = true },
                    containerColor = Color(0xFFDC2626)
                ) {
                    Icon(
                        Icons.Default.Add,
                        contentDescription = "Add Task",
                        tint = Color.White
                    )
                }
            }
        }
    ) { padding ->
        DoerNavHost(
            navController = navController,
            userId = userId,
            inboxProjectId = inboxProject?.id,
            projects = projectState.projects,
            allLabels = labelState.labels,
            authViewModel = authViewModel,
            taskViewModel = taskViewModel,
            projectViewModel = projectViewModel,
            labelViewModel = labelViewModel,
            modifier = Modifier.padding(padding)
        )
    }

    // Quick Add Dialog
    if (showQuickAdd) {
        QuickAddDialog(
            projects = projectState.projects,
            defaultProjectId = inboxProject?.id,
            onDismiss = { showQuickAdd = false },
            onAdd = { title, projectId, priority, dueDate ->
                taskViewModel.createTask(
                    userId = userId,
                    title = title,
                    projectId = projectId,
                    priority = priority,
                    dueDate = dueDate
                )
                showQuickAdd = false
            }
        )
    }

    // Label Manager Sheet
    if (showLabels) {
        LabelManagerSheet(
            labelViewModel = labelViewModel,
            userId = userId,
            onDismiss = { showLabels = false }
        )
    }
}
