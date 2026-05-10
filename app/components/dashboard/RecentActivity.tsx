'use client';

/**
 * Recent Activity Component
 * Shows latest lessons completed and achievements
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/lib/auth/AuthProvider';
import { getSupabase } from '@/app/lib/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface ActivityItem {
  id: string;
  type: 'lesson' | 'achievement' | 'level_up';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

export default function RecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadRecentActivity = async () => {
      try {
        const supabase = getSupabase();
        const activityList: ActivityItem[] = [];

        // Get recent lesson completions
        // Get recent lesson completions
        const { data: rawLessons } = await supabase
          .from('user_progress')
          .select('lesson_id, completed_at, xp_earned')
          .eq('user_id', user.id)
          .eq('completed', true)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(5);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lessons = rawLessons as any[] | null;

        lessons?.forEach((lesson) => {
          if (!lesson.completed_at) return;
          activityList.push({
            id: `lesson-${lesson.lesson_id}`,
            type: 'lesson',
            title: `Completed Lesson ${lesson.lesson_id}`,
            description: `+${lesson.xp_earned || 100} XP`,
            timestamp: lesson.completed_at,
            icon: '✅',
            color: 'bg-green-100 text-green-600',
          });
        });

        // Get recent achievements
        // Get recent achievements
        const { data: rawAchievements } = await supabase
          .from('achievements')
          .select('achievement_id, achievement_name, unlocked_at')
          .eq('user_id', user.id)
          .order('unlocked_at', { ascending: false })
          .limit(3);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const achievements = rawAchievements as any[] | null;

        achievements?.forEach((achievement) => {
          activityList.push({
            id: `achievement-${achievement.achievement_id}`,
            type: 'achievement',
            title: 'Achievement Unlocked!',
            description: achievement.achievement_name,
            timestamp: achievement.unlocked_at,
            icon: '🏆',
            color: 'bg-yellow-100 text-yellow-600',
          });
        });

        // Sort by timestamp
        activityList.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(activityList.slice(0, 8));
      } catch (error) {
        console.error('Error loading recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivity();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-surface-elevated rounded-3xl shadow-lg p-6 md:p-8">
        <div className="h-96 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-sui-ocean border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-3xl shadow-lg p-6 md:p-8 h-fit sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
          <p className="text-foreground-secondary text-sm mt-1">Your latest achievements</p>
        </div>
        <div className="w-12 h-12 bg-sui-sky rounded-xl flex items-center justify-center">
          <span className="text-2xl">⚡</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-sui-sky transition-colors"
            >
              {/* Icon */}
              <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <span className="text-xl">{activity.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">
                  {activity.title}
                </p>
                <p className="text-foreground-secondary text-xs mt-1">
                  {activity.description}
                </p>
                <p className="text-foreground-tertiary text-xs mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-foreground-secondary font-medium">No activity yet</p>
            <p className="text-foreground-tertiary text-sm mt-2">
              Start learning to see your activity here!
            </p>
          </div>
        )}
      </div>

      {/* View All Link */}
      {activities.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
          <button className="w-full px-4 py-2 bg-sui-sky text-sui-ocean font-semibold rounded-xl hover:bg-sui-ocean hover:text-white transition-colors">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
}
