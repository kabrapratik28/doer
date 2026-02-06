// Complete Task Edge Function
// Marks a task as done and updates the user's streak

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import type { CompleteTaskRequest, Task } from '../_shared/types.ts';

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

    const { id }: CompleteTaskRequest = await req.json();

    if (!id) {
      return errorResponse('INVALID_INPUT', 'Task ID is required');
    }

    // Update task to done
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .update({
        status: 'done',
        completed_at: new Date().toISOString(),
        priority: null, // Clear priority when done
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (taskError) {
      return errorResponse('UPDATE_FAILED', taskError.message);
    }

    // Update streak logic
    const today = new Date().toISOString().split('T')[0];
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count, streak_last_date')
      .eq('id', user.id)
      .single();

    let newStreakCount = 1;

    if (profile) {
      const lastDate = profile.streak_last_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === today) {
        // Already completed today, keep current streak
        newStreakCount = profile.streak_count;
      } else if (lastDate === yesterdayStr) {
        // Consecutive day, increment streak
        newStreakCount = profile.streak_count + 1;
      }
      // Otherwise reset to 1 (streak broken)
    }

    await supabase
      .from('profiles')
      .update({
        streak_count: newStreakCount,
        streak_last_date: today,
      })
      .eq('id', user.id);

    return jsonResponse({
      data: task as Task,
      streak: newStreakCount,
    });
  } catch (error) {
    console.error('Error in complete-task:', error);
    return errorResponse('INTERNAL_ERROR', error.message, 500);
  }
});
