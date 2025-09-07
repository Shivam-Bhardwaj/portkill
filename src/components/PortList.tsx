'use client';

import { useEffect } from 'react';
import { usePortStore } from '@/store/usePortStore';
import PortItem from './PortItem';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function PortList() {
  const { ports, isLoading, error, refreshPorts, lastUpdated } = usePortStore();

  useEffect(() => {
    refreshPorts();
  }, [refreshPorts]);

  const handleRefresh = () => {
    refreshPorts();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Active Ports
          </h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          Error: {error}
        </div>
      )}

      {isLoading && ports.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading ports...</span>
        </div>
      ) : ports.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No active ports found
        </div>
      ) : (
        <div className="grid gap-3">
          {ports.map((port) => (
            <PortItem key={`${port.pid}-${port.port}`} port={port} />
          ))}
        </div>
      )}
    </div>
  );
}