import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';

import OptionsPage from './Options';
import EquityPage from './EquityPage';

const App = () => {
  const [dark, setDark] = useState(true);



  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 text-gray-800 dark:text-gray-100 p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        {/* Nav */}
        <nav className="flex space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl shadow-md">
          {/* <NavLink
            to="/options"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
                ? 'bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white font-semibold shadow-inner'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            Options
          </NavLink> */}
          <NavLink
            to="/equity"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
                ? 'bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white font-semibold shadow-inner'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            Equity
          </NavLink>
        </nav>

        {/* Dark mode toggle */}
        <div className="flex items-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={dark}
              onChange={() => setDark((d) => !d)}
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-gray-700 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-gray-200 rounded-full transition-transform peer-checked:translate-x-5" />
          </label>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {dark ? 'Dark' : 'Light'} Mode
          </span>
        </div>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/equity" replace />} />
        {/* <Route path="/options" element={<OptionsPage />} /> */}
        <Route path="/equity" element={<EquityPage />} />
      </Routes>

    </div>
  );
};

export default App;
