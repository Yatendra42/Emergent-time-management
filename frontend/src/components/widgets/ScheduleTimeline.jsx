import React from 'react';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { Calendar, ChevronRight } from 'lucide-react';

const ScheduleTimeline = ({ tasks }) => {
  const today = new Date();
  const next3Days = [today, addDays(today, 1), addDays(today, 2)];

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      const taskDate = parseISO(task.due_date);
      return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    }).sort((a, b) => a.due_time.localeCompare(b.due_time));
  };

  const getDateLabel = (date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE');
  };

  return (
    <div 
      data-testid="schedule-timeline"
      className="bg-white dark:bg-[#27272A] rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-gray-800 h-full"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-lg font-medium text-gray-800 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Schedule
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {format(today, 'MMM yyyy')}
        </span>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
        {next3Days.map((date, dayIdx) => {
          const dayTasks = getTasksForDate(date);
          return (
            <div key={dayIdx} className="animate-fade-in" style={{ animationDelay: `${dayIdx * 0.1}s` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-sm font-medium ${
                  isToday(date) ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {getDateLabel(date)}
                </span>
                <span className="text-xs text-gray-400">
                  {format(date, 'MMM d')}
                </span>
              </div>

              {dayTasks.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  No tasks scheduled
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-3">
                    {dayTasks.map((task, idx) => (
                      <div 
                        key={task.id}
                        data-testid={`schedule-task-${task.id}`}
                        className="relative pl-6 group"
                      >
                        <div 
                          className="absolute left-0 top-2 w-3 h-3 rounded-full border-2 border-white dark:border-[#27272A] shadow-sm transition-transform group-hover:scale-125"
                          style={{ backgroundColor: task.color }}
                        />
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 transition-all hover:shadow-md hover:-translate-x-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {task.due_time}
                            </span>
                            <span 
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                task.status === 'completed' 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : task.status === 'in_progress'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="font-medium text-sm text-gray-800 dark:text-white mt-1">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleTimeline;
