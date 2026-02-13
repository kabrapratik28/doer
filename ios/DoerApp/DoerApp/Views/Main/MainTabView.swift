import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var authVM: AuthViewModel

    @StateObject private var projectVM = ProjectViewModel()
    @StateObject private var taskVM = TaskViewModel()
    @StateObject private var labelVM = LabelViewModel()

    @State private var selectedTab = 0
    @State private var showQuickAdd = false
    @State private var showSettings = false

    var body: some View {
        TabView(selection: $selectedTab) {
            TodayView()
                .tabItem {
                    Label("Today", systemImage: "calendar")
                }
                .tag(0)

            UpcomingView()
                .tabItem {
                    Label("Upcoming", systemImage: "calendar.badge.clock")
                }
                .tag(1)

            InboxView()
                .tabItem {
                    Label("Inbox", systemImage: "tray")
                }
                .tag(2)

            ProjectListView()
                .tabItem {
                    Label("Projects", systemImage: "folder")
                }
                .tag(3)
        }
        .tint(.doerRed)
        .sheet(isPresented: $showQuickAdd) {
            QuickAddSheet()
                .environmentObject(taskVM)
                .environmentObject(projectVM)
                .environmentObject(labelVM)
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
                .environmentObject(authVM)
                .environmentObject(labelVM)
        }
        .environmentObject(projectVM)
        .environmentObject(taskVM)
        .environmentObject(labelVM)
        .environment(\.showQuickAdd, $showQuickAdd)
        .environment(\.showSettings, $showSettings)
        .task {
            await projectVM.fetchProjects()
            await labelVM.fetchLabels()
        }
        .onChange(of: selectedTab) { _, _ in
            taskVM.invalidate()
        }
    }
}

// Environment keys for passing sheet bindings to child views
private struct ShowQuickAddKey: EnvironmentKey {
    static let defaultValue: Binding<Bool> = .constant(false)
}

private struct ShowSettingsKey: EnvironmentKey {
    static let defaultValue: Binding<Bool> = .constant(false)
}

extension EnvironmentValues {
    var showQuickAdd: Binding<Bool> {
        get { self[ShowQuickAddKey.self] }
        set { self[ShowQuickAddKey.self] = newValue }
    }
    var showSettings: Binding<Bool> {
        get { self[ShowSettingsKey.self] }
        set { self[ShowSettingsKey.self] = newValue }
    }
}
