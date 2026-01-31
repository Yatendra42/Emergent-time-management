import React, { useState } from 'react';
import Modal from './Modal';
import { Plus, Trash2 } from 'lucide-react';

const colors = ['#6C5CE7', '#00CEC9', '#FF7675', '#0984E3', '#FDCB6E', '#E17055'];

const AddCourseModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6C5CE7',
    chapters: [{ title: '', completed: false }]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const validChapters = formData.chapters.filter(ch => ch.title.trim());
    onSubmit({ ...formData, chapters: validChapters });
    setFormData({
      name: '',
      description: '',
      color: '#6C5CE7',
      chapters: [{ title: '', completed: false }]
    });
    onClose();
  };

  const addChapter = () => {
    setFormData(prev => ({
      ...prev,
      chapters: [...prev.chapters, { title: '', completed: false }]
    }));
  };

  const removeChapter = (index) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index)
    }));
  };

  const updateChapter = (index, title) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.map((ch, i) => 
        i === index ? { ...ch, title } : ch
      )
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Course">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Course Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            data-testid="course-name-input"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-gray-800 dark:text-white"
            placeholder="e.g., Web Development"
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
            data-testid="course-description-input"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-gray-800 dark:text-white resize-none"
            placeholder="Course description..."
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Color
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Chapters
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {formData.chapters.map((chapter, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={chapter.title}
                  onChange={(e) => updateChapter(idx, e.target.value)}
                  data-testid={`chapter-input-${idx}`}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-all text-sm text-gray-800 dark:text-white"
                  placeholder={`Chapter ${idx + 1}`}
                />
                {formData.chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChapter(idx)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addChapter}
            data-testid="add-chapter-btn"
            className="mt-2 flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
          </button>
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
            data-testid="submit-course-btn"
            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
          >
            Create Course
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCourseModal;
