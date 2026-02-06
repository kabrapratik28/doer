'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { TASK_CONSTRAINTS } from '@/types';

export function QuickCaptureInput() {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore((state) => state.addTask);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < TASK_CONSTRAINTS.MIN_TEXT_LENGTH) return;

    // Auto-capitalize first letter
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    addTask({ text: formatted });
    setText('');
    inputRef.current?.focus();
  }, [text, addTask]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        className="w-full h-14 bg-surface rounded-xl px-4 text-lg text-text-primary
                   placeholder:text-text-muted border-none outline-none
                   focus:ring-2 focus:ring-accent-gold/30 transition-shadow duration-200"
        maxLength={TASK_CONSTRAINTS.MAX_TEXT_LENGTH}
        autoComplete="off"
      />
    </form>
  );
}
