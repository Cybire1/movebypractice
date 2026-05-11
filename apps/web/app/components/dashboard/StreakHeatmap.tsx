'use client';

/**
 * Streak Heatmap Component
 * GitHub-style activity calendar
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/lib/auth/AuthProvider';
import { getSupabase } from '@/app/lib/supabase/client';
import { format, startOfYear, eachDayOfInterval, endOfDay } from 'date-fns';

interface DayActivity {
  date: string;
  count: number;
  level: number; // 0-4 for color intensity
}

export default function StreakHeatmap() {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalActiveDays, setTotalActiveDays] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadActivityData = async () => {
      try {
        const supabase = getSupabase();
        const today = new Date();
        const yearStart = startOfYear(today);

        // Get all days in the year
        const allDays = eachDayOfInterval({
          start: yearStart,
          end: today,
        });

        // Get user progress data
        // Get user progress data
        const { data: rawProgress } = await supabase
          .from('user_progress')
          .select('completed_at')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const progress = rawProgress as any[] | null;

        // Count lessons per day
        const activityMap = new Map<string, number>();

        progress?.forEach((p) => {
          if (!p.completed_at) return;
          const date = format(new Date(p.completed_at), 'yyyy-MM-dd');
          activityMap.set(date, (activityMap.get(date) || 0) + 1);
        });

        // Create heatmap data
        const heatmapData = allDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const count = activityMap.get(dateStr) || 0;

          // Calculate intensity level (0-4)
          let level = 0;
          if (count > 0) level = 1;
          if (count >= 2) level = 2;
          if (count >= 4) level = 3;
          if (count >= 6) level = 4;

          return {
            date: dateStr,
            count,
            level,
          };
        });

        setActivityData(heatmapData);
        setTotalActiveDays(Array.from(activityMap.keys()).length);
      } catch (error) {
        console.error('Error loading activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivityData();
  }, [user]);

  const getLevelColor = (level: number) => {
    const colors = {
      0: 'bg-surface-secondary',
      1: 'bg-green-200',
      2: 'bg-green-400',
      3: 'bg-green-600',
      4: 'bg-green-800',
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  if (loading) {
    return (
      <div className="bg-surface-elevated rounded-3xl shadow-lg p-6 md:p-8">
        <div className="h-48 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-sui-ocean border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Group by weeks
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7));
  }

  return (
    <div className="bg-surface-elevated rounded-3xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Activity Streak</h2>
          <p className="text-foreground-secondary text-sm mt-1">
            {totalActiveDays} active days this year
          </p>
        </div>
        <div className="w-12 h-12 bg-sui-sky rounded-xl flex items-center justify-center">
          <span className="text-2xl">📅</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex flex-col gap-1 min-w-full">
          {/* Day labels */}
          <div className="flex gap-1 mb-2 pl-12">
            {['Mon', 'Wed', 'Fri'].map((day, i) => (
              <div key={day} className="text-xs text-foreground-tertiary w-3" style={{ marginLeft: i === 0 ? 0 : '24px' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid - rotated to show days vertically */}
          <div className="flex gap-1">
            {/* Month labels column */}
            <div className="flex flex-col gap-1 w-10">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                <div key={month} className="text-xs text-foreground-tertiary h-3">
                  {i % 3 === 0 ? month : ''}
                </div>
              ))}
            </div>

            {/* Activity squares */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getLevelColor(day.level)} hover:ring-2 hover:ring-sui-ocean transition-all cursor-pointer`}
                      title={`${format(new Date(day.date), 'MMM dd, yyyy')}: ${day.count} lessons`}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--border-default)]">
        <span className="text-sm text-foreground-secondary">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-4 h-4 rounded-sm ${getLevelColor(level)}`}
            ></div>
          ))}
        </div>
        <span className="text-sm text-foreground-secondary">More</span>
      </div>
    </div>
  );
}
