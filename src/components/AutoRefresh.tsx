'use client';

import { useState, useEffect } from 'react';
import { usePortStore } from '@/store/usePortStore';
import { RotateCcw, Pause, Play } from 'lucide-react';

const REFRESH_INTERVALS = [
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
];

export default function AutoRefresh() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10000);
  const [timeLeft, setTimeLeft] = useState(0);
  const store = usePortStore();

  useEffect(() => {
    let refreshTimer: NodeJS.Timeout | null = null;
    let countdownTimer: NodeJS.Timeout | null = null;

    if (isEnabled) {
      setTimeLeft(refreshInterval / 1000);
      
      refreshTimer = setInterval(() => {
        store.refreshPorts();
        setTimeLeft(refreshInterval / 1000);
      }, refreshInterval);

      countdownTimer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return refreshInterval / 1000;
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(0);
    }

    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [isEnabled, refreshInterval, store]);

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Auto Refresh
        </span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
        >
          {REFRESH_INTERVALS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
            isEnabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {isEnabled ? (
            <>
              <Pause className="w-4 h-4" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start
            </>
          )}
        </button>
      </div>

      {isEnabled && timeLeft > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Next refresh in {timeLeft}s
        </div>
      )}
    </div>
  );
}