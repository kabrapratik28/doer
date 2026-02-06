// Reorder Tasks Edge Function
// Updates task priorities based on the provided order

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import type { ReorderTasksRequest, Task } from '../_shared/types.ts';
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

    const { task_ids }: ReorderTasksRequest = await req.json();

    if (!task_ids || !Array.isArray(task_ids)) {
      return errorResponse('INVALID_INPUT', 'task_ids array is required');
    }

    if (task_ids.length > MAX_ACTIVE_TASKS) {
      return errorResponse('INVALID_INPUT', `Maximum ${MAX_ACTIVE_TASKS} tasks can be reordered`);
    }

    // Update priorities based on array order
    const updates = task_ids.map((id, index) =>
      supabase
        .from('tasks')
        .update({ priority: index + 1 })
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('status', 'active')
    );

    await Promise.all(updates);

    // Fetch updated tasks
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: true });

    if (fetchError) {
      return errorResponse('FETCH_FAILED', fetchError.message);
    }

    return jsonResponse({ data: tasks as Task[] });
  } catch (error) {
    console.error('Error in reorder-tasks:', error);
    return errorResponse('INTERNAL_ERROR', error.message, 500);
  }
});
