import React from 'react';
import { Clock, CheckCircle2, BookOpen, TrendingUp } from 'lucide-react';

const iconMap = {
  hours: Clock,
  tasks: CheckCircle2,
  courses: BookOpen,
  progress: TrendingUp
};

const colorMap = {
  hours: 'bg-primary/10 text-primary',
  tasks: 'bg-secondary/10 text-secondary',
  courses: 'bg-accent/10 text-accent',
  progress: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
};

const StatsCard = ({ type, value, label, sublabel }) => {
  const Icon = iconMap[type] || Clock;
  const colorClass = colorMap[type] || colorMap.hours;

  return (
    <div 
      data-testid={`stats-card-${type}`}
      className="bg-white dark:bg-[#27272A] rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800 transition-all hover:shadow-hover hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="font-heading text-2xl font-semibold text-gray-800 dark:text-white">
            {value}
          </p>
          {sublabel && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sublabel}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
