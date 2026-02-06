# DOER Mobile

The mobile application for DOER - The Execution Engine. Built with Expo and React Native.

## Features

- **The Big One**: Prime task displayed at 2x scale
- **Rule of 3**: Maximum 3 active tasks at a time
- **Shredder**: Swipe-to-complete with particle animation
- **Focus Mode**: Fullscreen distraction-free view
- **Ideas Bottom Sheet**: Quick access to task backlog
- **Streak Counter**: Momentum tracking with visual feedback
- **Haptic Feedback**: Tactile responses for all interactions

## Tech Stack

- **Expo SDK 50+**: React Native development platform
- **NativeWind**: Tailwind CSS for React Native
- **TanStack Query**: Server state management
- **Zustand**: Client state management
- **React Native Gesture Handler**: Gesture-based interactions
- **React Native Reanimated**: Smooth animations
- **Supabase**: Backend integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm start
```

### Running on Device

```bash
# iOS
npm run ios

# Android
npm run android
```

## Project Structure

```
mobile/
├── App.tsx                    # App entry point
├── src/
│   ├── components/            # UI components
│   │   ├── layout/           # Header, BottomSheet
│   │   ├── tasks/            # Task cards, input
│   │   ├── focus/            # Focus mode
│   │   ├── ui/               # Buttons, inputs, etc.
│   │   └── animations/       # Shredder effect
│   ├── screens/              # Screen components
│   ├── navigation/           # Navigation setup
│   ├── providers/            # Context providers
│   ├── hooks/                # TanStack Query hooks
│   ├── stores/               # Zustand stores
│   ├── lib/                  # Utilities (Supabase, haptics)
│   └── types/                # TypeScript definitions
└── assets/                   # Images, fonts
```

## Design System

### Colors

- Background: `#000000` (True Black for OLED)
- Surface: `#1A1A1A`
- Text Primary: `#FFFFFF`
- Accent Gold: `#FFD700` (Momentum/Streak)

### Gestures

| Gesture | Action |
|---------|--------|
| Swipe Right (Active Task) | Complete (Shredder) |
| Swipe Right (Idea) | Promote to Active |
| Swipe Left (Idea) | Delete |
| Tap (Task) | Focus Mode |
| Swipe Up (Bottom) | Open Ideas Sheet |

## Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
```

## License

Private - All rights reserved
