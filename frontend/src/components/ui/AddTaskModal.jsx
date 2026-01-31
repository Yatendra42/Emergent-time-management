import React, { useState } from 'react';
import Modal from './Modal';
import { format, addDays } from 'date-fns';

const colors = ['#6C5CE7', '#00CEC9', '#FF7675', '#0984E3', '#FDCB6E', '#E17055'];
const priorities = ['low', 'medium', 'high'];

const AddTaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    due_time: '09:00',
    priority: 'medium',
    color: '#6C5CE7',
    status: 'upcoming'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      due_date: format(new Date(), 'yyyy-MM-dd'),
      due_time: '09:00',
      priority: 'medium',
      color: '#6C5CE7',
      status: 'upcoming'
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Task Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            data-testid="task-title-input"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-gray-800 dark:text-white"
            placeholder="e.g., Complete React Chapter 5"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            data-testid="task-description-input"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-gray-800 dark:text-white resize-none"
            placeholder="Task description..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              data-testid="task-date-input"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Time
            </label>
            <input
              type="time"
              value={formData.due_time}
              onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
              data-testid="task-time-input"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Priority
          </label>
          <div className="flex gap-2">
            {priorities.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  formData.priority === p
                    ? p === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 ring-2 ring-red-400'
                      : p === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 ring-2 ring-yellow-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-600 ring-2 ring-green-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Color Tag
          </label>
          <div className="flex gap-2">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color }))}
                className={`w-8 h-8 rounded-lg transition-all ${
                  formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="submit-task-btn"
            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
          >
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal;
