import { create } from 'zustand';
import { Port } from '@/types';
import { getRandomDemoPorts } from '@/data/demoData';

interface PortStore {
  ports: Port[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isDemo: boolean;
  setPorts: (ports: Port[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  removePort: (pid: string) => void;
  refreshPorts: () => Promise<void>;
  setDemoMode: (demo: boolean) => Promise<void>;
  killProcess: (pid: string, port: string) => Promise<boolean>;
}

export const usePortStore = create<PortStore>((set, get) => ({
  ports: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  isDemo: false,
  
  setPorts: (ports) => set({ ports, lastUpdated: new Date() }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  removePort: (pid) => set((state) => ({
    ports: state.ports.filter(port => port.pid !== pid)
  })),
  
  setDemoMode: async (demo) => {
    set({ isDemo: demo, error: null, isLoading: demo });
    if (demo) {
      try {
        const response = await fetch('/api/demo-ports');
        if (response.ok) {
          const data = await response.json();
          set({ ports: data.ports, lastUpdated: new Date() });
        } else {
          // Fallback to static demo data
          const demoPorts = getRandomDemoPorts();
          set({ ports: demoPorts, lastUpdated: new Date() });
        }
      } catch {
        // Fallback to static demo data
        const demoPorts = getRandomDemoPorts();
        set({ ports: demoPorts, lastUpdated: new Date() });
      } finally {
        set({ isLoading: false });
      }
    } else {
      set({ ports: [], isLoading: false });
    }
  },
  
  refreshPorts: async () => {
    const { isDemo } = get();
    set({ isLoading: true, error: null });
    
    try {
      if (isDemo) {
        // Use smart demo API that avoids real ports
        const response = await fetch('/api/demo-ports');
        if (!response.ok) {
          throw new Error('Failed to fetch demo ports');
        }
        const data = await response.json();
        set({ ports: data.ports, lastUpdated: new Date() });
      } else {
        const response = await fetch('/api/ports');
        if (!response.ok) {
          throw new Error('Failed to fetch ports');
        }
        const data = await response.json();
        set({ ports: data.ports, lastUpdated: new Date() });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  killProcess: async (pid: string, port: string) => {
    const { isDemo } = get();
    
    if (isDemo) {
      // Simulate kill delay
      await new Promise(resolve => setTimeout(resolve, 800));
      set((state) => ({
        ports: state.ports.filter(p => p.pid !== pid)
      }));
      return true;
    } else {
      try {
        const response = await fetch('/api/kill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pid, port })
        });
        
        if (response.ok) {
          set((state) => ({
            ports: state.ports.filter(p => p.pid !== pid)
          }));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
  }
}));