import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  ListTodo, 
  Clock, 
  Settings,
  Moon,
  Sun,
  Crown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', active: true },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: ListTodo, label: 'Task List', id: 'tasks' },
  { icon: Clock, label: 'Tracking', id: 'tracking' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

const Sidebar = ({ user, activeNav, setActiveNav }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <aside 
      data-testid="sidebar"
      className="fixed left-0 top-0 h-screen w-64 bg-white/80 dark:bg-[#27272A]/80 backdrop-blur-xl border-r border-gray-100 dark:border-gray-800 flex flex-col z-50 transition-all duration-300"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h1 className="font-heading text-xl font-semibold text-primary flex items-center gap-2">
          <Clock className="w-6 h-6" />
          TimeFlow
        </h1>
      </div>

      {/* Profile Section */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
            alt={user.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/20"
            data-testid="user-avatar"
          />
          <div className="overflow-hidden">
            <p className="font-heading font-medium text-gray-800 dark:text-gray-100 truncate" data-testid="user-name">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              data-testid={`nav-${item.id}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}      </nav>

      {/* Dark Mode Toggle */}
      <div className="px-4 pb-4">
        <button
          onClick={toggleDarkMode}
          data-testid="dark-mode-toggle"
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <span className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="font-medium text-sm">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${darkMode ? 'bg-primary' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      {/* Pro Plan Card */}
      <div className="p-4">
        <div 
          data-testid="pro-plan-card"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-5 text-white"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <Crown className="w-8 h-8 mb-3" />
          <p className="font-heading font-semibold text-sm mb-1">Upgrade to Pro</p>
          <p className="text-xs text-white/80 mb-3">Unlimited courses & tasks</p>
          <p className="font-heading font-bold text-lg">$9.99<span className="text-xs font-normal">/month</span></p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
