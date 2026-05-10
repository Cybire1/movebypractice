'use client';

/**
 * Stats Cards Component
 * Displays key metrics in card format
 */

import { motion } from 'framer-motion';

interface StatsCardsProps {
  xp: number;
  level: number;
  streak: number;
  completedLessons: number;
}

export default function StatsCards({ xp, level, streak, completedLessons }: StatsCardsProps) {
  const stats = [
    {
      label: 'Total XP',
      value: xp.toLocaleString(),
      icon: '⚡',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Current Level',
      value: level.toString(),
      icon: '🎯',
      color: 'from-sui-ocean to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Day Streak',
      value: streak.toString(),
      icon: '🔥',
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Lessons Completed',
      value: completedLessons.toString(),
      icon: '✅',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-surface-elevated rounded-2xl shadow-lg p-6 relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl`}></div>

          {/* Icon */}
          <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4 relative z-10`}>
            <span className="text-2xl">{stat.icon}</span>
          </div>

          {/* Value */}
          <div className="relative z-10">
            <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-foreground-secondary font-medium">
              {stat.label}
            </p>
          </div>

          {/* Decorative Border */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
        </motion.div>
      ))}
    </div>
  );
}
