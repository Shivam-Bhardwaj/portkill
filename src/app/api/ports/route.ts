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
    // Use more comprehensive netstat command to catch all listening ports
    const { stdout } = await execAsync('netstat -ano');
    const lines = stdout.split('\n').filter(line => line.trim() && line.includes('LISTENING'));
    
    const ports: Port[] = [];
    const seenPorts = new Set<string>();
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      
      // More flexible parsing - find the address and PID regardless of position
      let address = '';
      let pid = '';
      let protocol = 'TCP';
      
      // Find protocol (TCP or UDP)
      if (parts[0] && (parts[0].includes('TCP') || parts[0].includes('UDP'))) {
        protocol = parts[0];
      }
      
      // Find address (contains colon)
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] && parts[i].includes(':') && !address) {
          address = parts[i];
          break;
        }
      }
      
      // PID is usually the last part that's a number
      for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i] && !isNaN(Number(parts[i])) && Number(parts[i]) > 0) {
          pid = parts[i];
          break;
        }
      }
      
      if (address && pid && address.includes(':')) {
        const portNum = address.split(':').pop();
        if (portNum && !isNaN(Number(portNum)) && Number(portNum) > 0) {
          // Avoid duplicates
          const portKey = `${portNum}-${pid}`;
          if (!seenPorts.has(portKey)) {
            seenPorts.add(portKey);
            
            try {
              const { stdout: processInfo } = await execAsync(`tasklist /fi "pid eq ${pid}" /fo csv /nh`);
              const processName = processInfo.split(',')[0]?.replace(/"/g, '') || 'Unknown';
              
              ports.push({
                pid,
                port: portNum,
                protocol,
                status: 'LISTENING',
                name: processName
              });
            } catch {
              ports.push({
                pid,
                port: portNum,
                protocol,
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