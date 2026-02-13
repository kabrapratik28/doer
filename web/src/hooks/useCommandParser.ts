'use client'

import { useState, useMemo, useCallback } from 'react'

interface CommandState {
  type: '#' | '@' | null
  query: string
  startIndex: number
}

export function useCommandParser() {
  const [command, setCommand] = useState<CommandState>({ type: null, query: '', startIndex: 0 })

  const detectCommand = useCallback((value: string, cursorPos: number) => {
    // Look backwards from cursor to find # or @ trigger
    const textBeforeCursor = value.slice(0, cursorPos)

    // Find the last # or @ that starts a command (after a space or at start)
    let triggerIndex = -1
    let triggerChar: '#' | '@' | null = null

    for (let i = textBeforeCursor.length - 1; i >= 0; i--) {
      const ch = textBeforeCursor[i]
      if (ch === ' ' || ch === '\n') break // stop at space
      if (ch === '#' || ch === '@') {
        // Valid if at start of input or preceded by space
        if (i === 0 || textBeforeCursor[i - 1] === ' ') {
          triggerIndex = i
          triggerChar = ch as '#' | '@'
        }
        break
      }
    }

    if (triggerChar && triggerIndex >= 0) {
      const query = textBeforeCursor.slice(triggerIndex + 1)
      setCommand({ type: triggerChar, query, startIndex: triggerIndex })
    } else {
      setCommand({ type: null, query: '', startIndex: 0 })
    }
  }, [])

  const applyCommand = useCallback((
    currentValue: string,
    selectedName: string
  ): string => {
    if (!command.type) return currentValue
    // Remove the #query or @query from the title
    const before = currentValue.slice(0, command.startIndex)
    const afterToken = currentValue.slice(command.startIndex)
    // Find the end of the token (next space or end of string)
    const spaceAfter = afterToken.indexOf(' ', 1)
    const after = spaceAfter >= 0 ? afterToken.slice(spaceAfter) : ''
    return (before + after).trim()
  }, [command])

  const clearCommand = useCallback(() => {
    setCommand({ type: null, query: '', startIndex: 0 })
  }, [])

  return { command, detectCommand, applyCommand, clearCommand }
}
