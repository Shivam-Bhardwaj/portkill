'use client';

import { useState } from 'react';
import { Port, KillResponse } from '@/types';
import { usePortStore } from '@/store/usePortStore';
import { Trash2, Loader2, Server, Wifi } from 'lucide-react';

interface PortItemProps {
  port: Port;
}

export default function PortItem({ port }: PortItemProps) {
  const [isKilling, setIsKilling] = useState(false);
  const [killError, setKillError] = useState<string | null>(null);
  const { removePort, refreshPorts } = usePortStore();

  const handleKillPort = async () => {
    setIsKilling(true);
    setKillError(null);

    try {
      const response = await fetch('/api/kill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pid: port.pid, port: port.port }),
      });

      const data: KillResponse = await response.json();

      if (data.success) {
        removePort(port.pid);
        setTimeout(() => {
          refreshPorts();
        }, 1000);
      } else {
        setKillError(data.error || 'Failed to kill process');
      }
    } catch (error) {
      setKillError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsKilling(false);
    }
  };

  const isCommonDevPort = (portNum: string) => {
    const commonPorts = ['3000', '3001', '4000', '5000', '8000', '8080', '8001'];
    return commonPorts.includes(portNum);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isCommonDevPort(port.port) ? (
              <Server className="w-5 h-5 text-green-600" />
            ) : (
              <Wifi className="w-5 h-5 text-blue-600" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                  :{port.port}
                </span>
                {isCommonDevPort(port.port) && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/20 dark:text-green-400">
                    DEV
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {port.protocol} • PID: {port.pid}
              </div>
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {port.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {port.status}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {killError && (
            <div className="text-xs text-red-600 dark:text-red-400 max-w-xs">
              {killError}
            </div>
          )}
          <button
            onClick={handleKillPort}
            disabled={isKilling}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isKilling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isKilling ? 'Killing...' : 'Kill'}
          </button>
        </div>
      </div>
    </div>
  );
}