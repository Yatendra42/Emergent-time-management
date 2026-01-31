import React, { useState } from 'react';
import { CheckCircle2, Circle, Trash2, Clock, Flag } from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
};

const statusColors = {
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  upcoming: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
};

const TaskList = ({ tasks, onUpdateTask, onDeleteTask }) => {
  const [activeTab, setActiveTab] = useState('today');

  const filterTasks = (tasks) => {
    const now = new Date();
    return tasks.filter(task => {
      const dueDate = parseISO(task.due_date);
      switch (activeTab) {
        case 'today':
          return isToday(dueDate);
        case 'week':
          return isThisWeek(dueDate, { weekStartsOn: 1 });
        case 'month':
          return isThisMonth(dueDate);
        default:
          return true;
      }
    });
  };

  const filteredTasks = filterTasks(tasks);

  const toggleStatus = (task) => {
    const newStatus = task.status === 'completed' ? 'upcoming' : 'completed';
    onUpdateTask(task.id, { status: newStatus });
  };

  return (
    <div 
      data-testid="task-list-widget"
      className="bg-white dark:bg-[#27272A] rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-lg font-medium text-gray-800 dark:text-white">
          Tasks
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['today', 'week', 'month'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            data-testid={`task-tab-${tab}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No tasks for this period</p>
          </div>
        ) : (
          filteredTasks.map((task, idx) => (
            <div
              key={task.id}
              data-testid={`task-item-${task.id}`}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800 animate-fade-in`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <button
                onClick={() => toggleStatus(task)}
                data-testid={`task-toggle-${task.id}`}
                className="mt-0.5 flex-shrink-0"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 hover:text-primary transition-colors" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${
                  task.status === 'completed' 
                    ? 'line-through text-gray-400 dark:text-gray-500' 
                    : 'text-gray-800 dark:text-white'
                }`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {format(parseISO(task.due_date), 'MMM d')} • {task.due_time}
                  </span>
                  <Flag className={`w-3 h-3 ${priorityColors[task.priority]}`} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: task.color }}
                />
                <button
                  onClick={() => onDeleteTask(task.id)}
                  data-testid={`task-delete-${task.id}`}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
