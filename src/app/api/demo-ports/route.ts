import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DemoPort {
  pid: string;
  port: string;
  protocol: string;
  status: string;
  name: string;
}

const DEMO_PORT_POOL = [
  { port: '3000', name: 'node.exe', common: true },
  { port: '3001', name: 'next-server', common: true },
  { port: '4000', name: 'node.exe', common: true },
  { port: '5000', name: 'node.exe', common: true },
  { port: '8000', name: 'python.exe', common: true },
  { port: '8001', name: 'vite.exe', common: true },
  { port: '8080', name: 'java.exe', common: true },
  { port: '9000', name: 'webpack-dev-server', common: true },
  { port: '3002', name: 'react-scripts', common: false },
  { port: '4001', name: 'express.js', common: false },
  { port: '5001', name: 'flask.exe', common: false },
  { port: '6000', name: 'gatsby.exe', common: false },
  { port: '7000', name: 'nuxt.exe', common: false },
  { port: '8002', name: 'django.exe', common: false },
  { port: '9001', name: 'angular-cli', common: false },
  { port: '10000', name: 'custom-server', common: false }
];

async function getUsedPorts(): Promise<Set<string>> {
  try {
    const { stdout } = await execAsync('netstat -ano | findstr LISTENING');
    const lines = stdout.split('\n').filter(line => line.trim());
    const usedPorts = new Set<string>();
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const address = parts[1];
        if (address && address.includes(':')) {
          const port = address.split(':').pop();
          if (port && !isNaN(Number(port))) {
            usedPorts.add(port);
          }
        }
      }
    }
    
    return usedPorts;
  } catch (error) {
    console.error('Error getting used ports:', error);
    return new Set();
  }
}

function generateRandomPid(): string {
  return Math.floor(Math.random() * 9000 + 1000).toString();
}

export async function GET() {
  try {
    const usedPorts = await getUsedPorts();
    
    // Filter out ports that are actually in use
    const availablePorts = DEMO_PORT_POOL.filter(p => !usedPorts.has(p.port));
    
    // If too few available ports, fall back to high-number ports that are unlikely to be used
    const fallbackPorts = [
      { port: '19000', name: 'demo-server-1', common: false },
      { port: '19001', name: 'demo-server-2', common: false },
      { port: '19002', name: 'demo-server-3', common: false },
      { port: '19003', name: 'demo-server-4', common: false },
    ].filter(p => !usedPorts.has(p.port));
    
    const allAvailable = [...availablePorts, ...fallbackPorts];
    
    // Shuffle and pick 3-6 ports
    const shuffled = allAvailable.sort(() => 0.5 - Math.random());
    const count = Math.min(Math.floor(Math.random() * 4) + 3, shuffled.length);
    const selectedPorts = shuffled.slice(0, count);
    
    const demoPorts: DemoPort[] = selectedPorts.map(portData => ({
      pid: generateRandomPid(),
      port: portData.port,
      protocol: 'TCP',
      status: 'LISTENING',
      name: portData.name
    }));
    
    return NextResponse.json({ 
      ports: demoPorts.sort((a, b) => Number(a.port) - Number(b.port)),
      info: {
        totalAvailable: allAvailable.length,
        usedPortsCount: usedPorts.size,
        selectedCount: demoPorts.length
      }
    });
  } catch (error) {
    console.error('Demo ports API error:', error);
    
    // Fallback to safe high-number ports if everything fails
    const safePorts: DemoPort[] = [
      { pid: '1234', port: '19000', protocol: 'TCP', status: 'LISTENING', name: 'demo-server' },
      { pid: '5678', port: '19001', protocol: 'TCP', status: 'LISTENING', name: 'test-app' },
      { pid: '9012', port: '19002', protocol: 'TCP', status: 'LISTENING', name: 'dev-tool' }
    ];
    
    return NextResponse.json({ 
      ports: safePorts,
      info: {
        fallback: true,
        message: 'Using safe fallback ports'
      }
    });
  }
}