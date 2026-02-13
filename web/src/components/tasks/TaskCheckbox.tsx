'use client'

import { cn } from '@/lib/utils'
import { PRIORITY_BORDER_COLORS, PRIORITY_BG_COLORS } from '@/lib/constants'
import type { Priority } from '@/types'

interface TaskCheckboxProps {
  priority: Priority
  checked: boolean
  onChange: () => void
  className?: string
}

export default function TaskCheckbox({ priority, checked, onChange, className }: TaskCheckboxProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={cn(
        'flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 transition-all duration-200 shrink-0',
        checked
          ? `${PRIORITY_BG_COLORS[priority]} border-transparent`
          : `${PRIORITY_BORDER_COLORS[priority]} hover:bg-gray-50`,
        className
      )}
    >
      {checked && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className="text-white"
        >
          <path
            d="M2 5L4 7L8 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check-animation"
            style={{ strokeDasharray: 24, strokeDashoffset: 0 }}
          />
        </svg>
      )}
    </button>
  )
}
