import { create } from 'zustand';
import { Port } from '@/types';

interface PortStore {
  ports: Port[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  setPorts: (ports: Port[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  removePort: (pid: string) => void;
  refreshPorts: () => Promise<void>;
}

export const usePortStore = create<PortStore>((set) => ({
  ports: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  setPorts: (ports) => set({ ports, lastUpdated: new Date() }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  removePort: (pid) => set((state) => ({
    ports: state.ports.filter(port => port.pid !== pid)
  })),
  
  refreshPorts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/ports');
      if (!response.ok) {
        throw new Error('Failed to fetch ports');
      }
      const data = await response.json();
      set({ ports: data.ports, lastUpdated: new Date() });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  }
}));