import React from 'react';
import { Play, CheckCircle, Users } from 'lucide-react';

const CourseCard = ({ course, onToggleChapter }) => {
  const completedChapters = course.chapters.filter(ch => ch.completed).length;
  const totalChapters = course.chapters.length;

  return (
    <div 
      data-testid={`course-card-${course.id}`}
      className="bg-white dark:bg-[#27272A] rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800 transition-all hover:shadow-hover hover:-translate-y-0.5 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${course.color}20` }}
        >
          <Play className="w-5 h-5" style={{ color: course.color }} />
        </div>
        <div className="flex -space-x-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-[#27272A]" />
          <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-[#27272A]" />
        </div>
      </div>

      {/* Title */}
      <h3 className="font-heading font-medium text-gray-800 dark:text-white mb-2 group-hover:text-primary transition-colors">
        {course.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
        {course.description || 'No description'}
      </p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500 dark:text-gray-400">
            {completedChapters}/{totalChapters} chapters
          </span>
          <span className="font-medium" style={{ color: course.color }}>
            {course.progress}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full progress-animate transition-all"
            style={{ 
              width: `${course.progress}%`, 
              backgroundColor: course.color 
            }}
          />
        </div>
      </div>

      {/* Chapters List (collapsed) */}
      <div className="space-y-1.5 max-h-32 overflow-y-auto">
        {course.chapters.slice(0, 3).map((chapter, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onToggleChapter(course.id, idx);
            }}
            data-testid={`chapter-toggle-${course.id}-${idx}`}
            className={`w-full flex items-center gap-2 text-xs p-2 rounded-lg transition-all ${
              chapter.completed 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${chapter.completed ? 'fill-current' : ''}`} />
            <span className="truncate">{chapter.title}</span>
          </button>
        ))}
        {course.chapters.length > 3 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-1">
            +{course.chapters.length - 3} more chapters
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
