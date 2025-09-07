'use client';

import { useState } from 'react';
import { Play, Square, Info } from 'lucide-react';

interface DemoModeProps {
  isDemo: boolean;
  onToggleDemo: (enabled: boolean) => void;
}

export default function DemoMode({ isDemo, onToggleDemo }: DemoModeProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded">
          <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Demo Mode
        </span>
      </div>

      <button
        onClick={() => onToggleDemo(!isDemo)}
        className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
          isDemo
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        {isDemo ? (
          <>
            <Square className="w-4 h-4" />
            Stop Demo
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Try Demo
          </>
        )}
      </button>

      <button
        onClick={() => setShowInfo(!showInfo)}
        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded"
      >
        <Info className="w-4 h-4" />
      </button>

      {showInfo && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Demo mode simulates port monitoring with sample data. Perfect for testing the interface without running actual system commands.
          </p>
        </div>
      )}

      {isDemo && (
        <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">
          Simulated Data
        </div>
      )}
    </div>
  );
}