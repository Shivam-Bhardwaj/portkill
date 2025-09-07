import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Port {
  pid: string;
  port: string;
  protocol: string;
  status: string;
  name: string;
}

async function getActivePorts(): Promise<Port[]> {
  try {
    const { stdout } = await execAsync('netstat -ano | findstr LISTENING');
    const lines = stdout.split('\n').filter(line => line.trim());
    
    const ports: Port[] = [];
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const address = parts[1];
        const pid = parts[4];
        
        if (address && address.includes(':')) {
          const port = address.split(':').pop();
          if (port && !isNaN(Number(port))) {
            try {
              const { stdout: processInfo } = await execAsync(`tasklist /fi "pid eq ${pid}" /fo csv /nh`);
              const processName = processInfo.split(',')[0]?.replace(/"/g, '') || 'Unknown';
              
              ports.push({
                pid,
                port,
                protocol: parts[0] || 'TCP',
                status: 'LISTENING',
                name: processName
              });
            } catch {
              ports.push({
                pid,
                port,
                protocol: parts[0] || 'TCP',
                status: 'LISTENING',
                name: 'Unknown'
              });
            }
          }
        }
      }
    }
    
    return ports.sort((a, b) => Number(a.port) - Number(b.port));
  } catch (error) {
    console.error('Error getting active ports:', error);
    return [];
  }
}

export async function GET() {
  try {
    const ports = await getActivePorts();
    return NextResponse.json({ ports });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch ports' }, { status: 500 });
  }
}