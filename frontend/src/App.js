import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Plus, RefreshCw, Menu, X } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import StatsCard from './components/widgets/StatsCard';
import CourseCard from './components/widgets/CourseCard';
import TaskList from './components/widgets/TaskList';
import ScheduleTimeline from './components/widgets/ScheduleTimeline';
import AddCourseModal from './components/ui/AddCourseModal';
import AddTaskModal from './components/ui/AddTaskModal';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function Dashboard() {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  });
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    hours_this_week: 0,
    completed_tasks: 0,
    total_courses: 0,
    average_progress: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const today = new Date();
  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, tasksRes, statsRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/courses`),
        axios.get(`${API_URL}/api/tasks`),
        axios.get(`${API_URL}/api/stats`),
        axios.get(`${API_URL}/api/settings`)
      ]);
      setCourses(coursesRes.data);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
      if (settingsRes.data.user_name) {
        setUser(prev => ({
          ...prev,
          name: settingsRes.data.user_name,
          email: settingsRes.data.user_email
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seed data (development)
  const seedData = async () => {
    try {
      await axios.post(`${API_URL}/api/seed`);
      fetchData();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Course actions
  const createCourse = async (courseData) => {
    try {
      const res = await axios.post(`${API_URL}/api/courses`, courseData);
      setCourses(prev => [...prev, res.data]);
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const toggleChapter = async (courseId, chapterIndex) => {
    try {
      const res = await axios.put(`${API_URL}/api/courses/${courseId}/chapters/${chapterIndex}/toggle`);
      setCourses(prev => prev.map(c => c.id === courseId ? res.data : c));
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error toggling chapter:', error);
    }
  };

  // Task actions
  const createTask = async (taskData) => {
    try {
      const res = await axios.post(`${API_URL}/api/tasks`, taskData);
      setTasks(prev => [...prev, res.data]);
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const res = await axios.put(`${API_URL}/api/tasks/${taskId}`, taskData);
      setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#18181B] transition-colors duration-300">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-[60] lg:hidden p-2 rounded-xl bg-white dark:bg-[#27272A] shadow-lg"
        data-testid="mobile-menu-btn"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar user={user} activeNav={activeNav} setActiveNav={setActiveNav} />
      </div>

      {/* Sidebar - Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64">
            <Sidebar user={user} activeNav={activeNav} setActiveNav={setActiveNav} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="flex flex-col xl:flex-row">
          {/* Center Panel */}
          <div className="flex-1 p-6 lg:p-8">
            {/* Header */}
            <header className="mb-8 pt-12 lg:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 
                    className="font-heading text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-white"
                    data-testid="greeting-text"
                  >
                    {greeting()}, {user.name.split(' ')[0]}!
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Today is {format(today, 'EEEE, d MMMM yyyy')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={seedData}
                    data-testid="seed-data-btn"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Seed Data</span>
                  </button>
                  <button
                    onClick={() => setShowCourseModal(true)}
                    data-testid="add-course-btn"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/25 hover:-translate-y-0.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Course</span>
                  </button>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    data-testid="add-task-btn"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Task</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Stats Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard 
                type="hours" 
                value={`${stats.hours_this_week}h`} 
                label="Hours Tracked" 
                sublabel="This week" 
              />
              <StatsCard 
                type="tasks" 
                value={stats.completed_tasks} 
                label="Tasks Completed" 
                sublabel={`${stats.pending_tasks || 0} pending`} 
              />
              <StatsCard 
                type="courses" 
                value={stats.total_courses} 
                label="Active Courses" 
                sublabel="In progress" 
              />
              <StatsCard 
                type="progress" 
                value={`${stats.average_progress}%`} 
                label="Avg. Progress" 
                sublabel="All courses" 
              />
            </section>

            {/* Course Progress Cards */}
            <section className="mb-8">
              <h2 className="font-heading text-lg font-medium text-gray-800 dark:text-white mb-4">
                Course Progress
              </h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-[#27272A] rounded-2xl p-5 animate-pulse">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div 
                  data-testid="no-courses-message"
                  className="bg-white dark:bg-[#27272A] rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-800"
                >
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No courses yet. Add your first course!</p>
                  <button
                    onClick={() => setShowCourseModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Course
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course, idx) => (
                    <div key={course.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <CourseCard course={course} onToggleChapter={toggleChapter} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Task List */}
            <section>
              <TaskList 
                tasks={tasks} 
                onUpdateTask={updateTask} 
                onDeleteTask={deleteTask} 
              />
            </section>
          </div>

          {/* Right Sidebar - Schedule */}
          <aside className="w-full xl:w-96 p-6 lg:p-8 xl:pl-0 xl:border-l border-gray-100 dark:border-gray-800">
            <ScheduleTimeline tasks={tasks} />
          </aside>
        </div>
      </main>

      {/* Modals */}
      <AddCourseModal 
        isOpen={showCourseModal} 
        onClose={() => setShowCourseModal(false)} 
        onSubmit={createCourse} 
      />
      <AddTaskModal 
        isOpen={showTaskModal} 
        onClose={() => setShowTaskModal(false)} 
        onSubmit={createTask} 
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
