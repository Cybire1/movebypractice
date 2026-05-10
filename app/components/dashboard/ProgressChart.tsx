'use client';

/**
 * Progress Chart Component
 * Visualizes XP and level progression over time
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/lib/auth/AuthProvider';
import { getSupabase } from '@/app/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

interface ProgressData {
  date: string;
  xp: number;
  level: number;
}

export default function ProgressChart() {
  const { user } = useAuth();
  const [data, setData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadProgressData = async () => {
      try {
        const supabase = getSupabase();

        // Get analytics events for XP gains
        // Get analytics events for XP gains
        const { data: rawEvents } = await supabase
          .from('analytics_events')
          .select('created_at, event_data')
          .eq('user_id', user.id)
          .eq('event_type', 'xp_gained')
          .order('created_at', { ascending: true });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const events = rawEvents as any[] | null;

        // Get user progress completions
        // Get user progress completions
        const { data: rawProgress } = await supabase
          .from('user_progress')
          .select('completed_at, xp_earned')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: true });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const progress = rawProgress as any[] | null;

        // Combine and aggregate by day
        const progressMap = new Map<string, { xp: number; level: number }>();
        let cumulativeXP = 0;

        // Process progress data
        progress?.forEach((p) => {
          if (!p.completed_at) return;

          const date = format(new Date(p.completed_at), 'MMM dd');
          cumulativeXP += p.xp_earned || 0;
          const level = Math.floor(cumulativeXP / 1000) + 1;

          progressMap.set(date, { xp: cumulativeXP, level });
        });

        // Convert to array
        const chartData = Array.from(progressMap.entries()).map(([date, stats]) => ({
          date,
          xp: stats.xp,
          level: stats.level,
        }));

        // If no data, create sample data for last 7 days
        if (chartData.length === 0) {
          const today = new Date();
          const sampleData = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            sampleData.push({
              date: format(date, 'MMM dd'),
              xp: 0,
              level: 1,
            });
          }
          setData(sampleData);
        } else {
          setData(chartData);
        }
      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgressData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-surface-elevated rounded-3xl shadow-lg p-6 md:p-8">
        <div className="h-80 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-sui-ocean border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-3xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Progress Overview</h2>
          <p className="text-foreground-secondary text-sm mt-1">Your XP growth over time</p>
        </div>
        <div className="w-12 h-12 bg-sui-sky rounded-xl flex items-center justify-center">
          <span className="text-2xl">📈</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6FBCF0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6FBCF0" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5F3FF" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #6FBCF0',
                  borderRadius: '12px',
                  padding: '12px',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#0A2540' }}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#6FBCF0"
                strokeWidth={3}
                fill="url(#xpGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-foreground-secondary font-medium">No progress data yet</p>
              <p className="text-foreground-tertiary text-sm mt-2">Complete lessons to see your progress!</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-sui-ocean rounded"></div>
          <span className="text-sm text-foreground-secondary">Total XP</span>
        </div>
      </div>
    </div>
  );
}
