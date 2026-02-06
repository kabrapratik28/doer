// Weekly Stats Edge Function
// Returns velocity score and task statistics for the current week

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import type { WeeklyStats } from '../_shared/types.ts';

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

    // Calculate week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(now);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString();

    // Count completed tasks this week
    const { count: completedCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'done')
      .gte('completed_at', weekStartStr);

    // Count created tasks this week
    const { count: createdCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', weekStartStr);

    const tasksCompleted = completedCount || 0;
    const tasksCreated = createdCount || 0;
    const velocityScore = tasksCreated > 0
      ? Math.round((tasksCompleted / tasksCreated) * 100)
      : 0;

    const stats: WeeklyStats = {
      week_start: weekStartStr.split('T')[0],
      tasks_completed: tasksCompleted,
      tasks_created: tasksCreated,
      velocity_score: velocityScore,
    };

    return jsonResponse({ data: stats });
  } catch (error) {
    console.error('Error in weekly-stats:', error);
    return errorResponse('INTERNAL_ERROR', error.message, 500);
  }
});
