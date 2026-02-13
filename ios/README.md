# Doer — iOS App

Native Swift/SwiftUI iOS application targeting iOS 17+.

## Tech Stack

- **Language**: Swift 5.9+
- **UI**: SwiftUI (iOS 17+)
- **Backend**: Supabase Swift SDK v2.5.1
- **Architecture**: MVVM with ObservableObject ViewModels

## Setup

### 1. Configure credentials

```bash
cp DoerApp/Config.secrets.swift.example DoerApp/Config.secrets.swift
```

Edit `Config.secrets.swift` with your Supabase credentials:

```swift
enum Secrets {
    static let supabaseURL = "https://your-project.supabase.co"
    static let supabaseAnonKey = "your-anon-key"
}
```

### 2. Open in Xcode

```bash
open DoerApp.xcodeproj
```

Or regenerate the project if needed:

```bash
brew install xcodegen   # if not installed
xcodegen generate
open DoerApp.xcodeproj
```

### 3. Build and run

1. Wait for Swift Package Manager to resolve dependencies
2. If SPM fails: **File > Packages > Reset Package Caches**
3. Select an iPhone simulator
4. Press **Cmd+R** to build and run

## Project Structure

```
DoerApp/
├── DoerApp.swift           App entry point
├── Config.swift            Reads from Config.secrets.swift
├── Models/                 Codable data models
├── Services/               Supabase API services
├── ViewModels/             ObservableObject ViewModels
├── Views/
│   ├── Auth/               Login, Signup
│   ├── Main/               Tab view, Quick Add, Inbox
│   ├── Tasks/              Task list, detail, row
│   ├── FilterViews/        Today, Upcoming
│   ├── Projects/           Project list, detail, form
│   ├── Labels/             Label manager
│   ├── Settings/           Profile, password
│   └── Components/         Reusable UI (checkbox, badge)
└── Utilities/              Date, color, position helpers
```
