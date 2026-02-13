import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isTomorrow, isYesterday, isPast, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  const diff = differenceInDays(date, new Date())
  if (diff > 0 && diff < 7) return format(date, 'EEEE')
  return format(date, 'MMM d')
}

export function getDueDateColor(dateStr: string | null): string {
  if (!dateStr) return 'text-gray-500'
  const date = new Date(dateStr + 'T00:00:00')
  if (isToday(date)) return 'text-green-600'
  if (isPast(date)) return 'text-red-600'
  if (isTomorrow(date)) return 'text-orange-500'
  return 'text-gray-500'
}

export function getDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
