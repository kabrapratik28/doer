export const TASK_CONSTRAINTS = {
  MAX_ACTIVE_TASKS: 3,
  MAX_TEXT_LENGTH: 500,
  MIN_TEXT_LENGTH: 1,
} as const;

export const USER_DEFAULTS = {
  RESET_TIME: '04:00',
  HAPTICS_ENABLED: true,
  TIMEZONE: 'UTC',
} as const;

export const CLARITY_PROMPT_DELAY_MS = 15 * 60 * 1000; // 15 minutes

// Gesture thresholds
export const GESTURE_THRESHOLDS = {
  SWIPE_THRESHOLD: 150,
  VELOCITY_THRESHOLD: 500,
  IDEA_SWIPE_THRESHOLD: 100,
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  INSTANT: 100,
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  SHRED: 600,
} as const;

// UI sizes
export const UI_SIZES = {
  PRIME_TASK_HEIGHT: 120,
  STANDARD_TASK_HEIGHT: 56,
  INPUT_HEIGHT: 56,
  TOUCH_TARGET: 44,
} as const;
