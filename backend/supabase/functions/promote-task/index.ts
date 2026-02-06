// Promote Task Edge Function
// Moves a task from 'idea' to 'active' status
// Enforces the Rule of 3 (max 3 active tasks)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import type { PromoteTaskRequest, Task } from '../_shared/types.ts';
import { MAX_ACTIVE_TASKS } from '../_shared/types.ts';

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('UNAUTHORIZED', 'Missing authorization header', 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return errorResponse('UNAUTHORIZED', 'Invalid or expired token', 401);
    }

    const { id, priority: requestedPriority }: PromoteTaskRequest = await req.json();

    if (!id) {
      return errorResponse('INVALID_INPUT', 'Task ID is required');
    }

    // Check current active count
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (count !== null && count >= MAX_ACTIVE_TASKS) {
      return errorResponse(
        'MAX_ACTIVE_REACHED',
        'Maximum 3 active tasks allowed. Complete one first.',
        400
      );
    }

    // Determine priority (next available: 1, 2, or 3)
    const { data: activeTasks } = await supabase
      .from('tasks')
      .select('priority')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: true });

    const usedPriorities = new Set(activeTasks?.map((t) => t.priority) || []);
    let assignedPriority = requestedPriority;

    if (!assignedPriority || usedPriorities.has(assignedPriority)) {
      // Find next available priority
      for (let p = 1; p <= 3; p++) {
        if (!usedPriorities.has(p)) {
          assignedPriority = p;
          break;
        }
      }
    }

    // Verify task exists and belongs to user
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingTask) {
      return errorResponse('NOT_FOUND', 'Task not found');
    }

    if (existingTask.status !== 'idea') {
      return errorResponse('INVALID_STATUS', 'Only idea tasks can be promoted');
    }

    // Update task
    const { data: task, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'active',
        priority: assignedPriority,
        is_from_yesterday: false,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return errorResponse('UPDATE_FAILED', updateError.message);
    }

    return jsonResponse({ data: task as Task });
  } catch (error) {
    console.error('Error in promote-task:', error);
    return errorResponse('INTERNAL_ERROR', error.message, 500);
  }
});
