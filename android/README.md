# Doer — Android App

Native Kotlin/Jetpack Compose Android application targeting API 26+.

## Tech Stack

- **Language**: Kotlin 2.0
- **UI**: Jetpack Compose with Material 3
- **Backend**: Supabase Kotlin SDK v3.0.2
- **Architecture**: MVVM with ViewModel + StateFlow
- **Navigation**: Jetpack Navigation Compose
- **Serialization**: kotlinx-serialization-json

## Setup

### 1. Configure credentials

```bash
cp DoerApp/local.properties.example DoerApp/local.properties
```

Edit `local.properties` with your Supabase credentials:

```properties
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 2. Open in Android Studio

Open the `DoerApp/` directory in Android Studio.

### 3. Build and run

1. Let Gradle sync and download dependencies
2. Select an emulator or connected device
3. Press **Shift+F10** (or click Run)

## Project Structure

```
app/src/main/java/com/doer/app/
├── DoerApplication.kt      Application class
├── MainActivity.kt          Single activity
├── DoerApp.kt               Root composable with auth routing
├── data/
│   ├── model/               @Serializable data classes
│   ├── remote/              Supabase client singleton
│   └── repository/          Auth, Task, Project, Label repos
├── ui/
│   ├── auth/                Login, Signup, AuthViewModel
│   ├── main/                MainScreen, NavHost, QuickAdd
│   ├── tasks/               Task screens and ViewModel
│   ├── projects/            Project screens and ViewModel
│   ├── labels/              Label manager and ViewModel
│   ├── settings/            Settings screen
│   └── components/          Checkbox, LabelChip
└── util/                    Date, color, position helpers
```
