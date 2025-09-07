import { Port } from '@/types';

export const demoPortsData: Port[] = [
  {
    pid: '1234',
    port: '3000',
    protocol: 'TCP',
    status: 'LISTENING',
    name: 'node.exe'
  },
  {
    pid: '5678',
    port: '8000',
    protocol: 'TCP',
    status: 'LISTENING',
    name: 'python.exe'
  },
  {
    pid: '9012',
    port: '4000',
    protocol: 'TCP',
    status: 'LISTENING',
    name: 'node.exe'
  },
  {
    pid: '3456',
    port: '8080',
    protocol: 'TCP',
    status: 'LISTENING',
    name: 'java.exe'
  },
  {
    pid: '7890',
    port: '5000',
    protocol: 'TCP',
    status: 'LISTENING',
    name: 'node.exe'
  },
  {
    pid: '2345',
    port: '9000',
    protocol: 'TCP',
    status: 'LISTENING',
    name: 'webpack-dev-server'
  },
  {
    pid: '6789',
    port: '3001',
    protocol: 'TCP',
    status: 'LISTENING',
    name: 'next-server'
  },
  {
    pid: '1357',
    port: '8001',
    protocol: 'TCP',
    status: 'LISTENING',
    name: 'vite.exe'
  }
];

export function getRandomDemoPorts(): Port[] {
  const shuffled = [...demoPortsData].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * 4) + 3; // 3-6 ports
  return shuffled.slice(0, count);
}