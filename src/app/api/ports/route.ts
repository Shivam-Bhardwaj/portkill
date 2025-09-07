import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

interface Port {
  pid: string;
  port: string;
  protocol: string;
  status: string;
  name: string;
}

function runNetstat(): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('netstat', ['-ano'], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`netstat failed with code ${code}: ${stderr}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

function getProcessName(pid: string): Promise<string> {
  return new Promise((resolve) => {
    const child = spawn('tasklist', ['/fi', `pid eq ${pid}`, '/fo', 'csv', '/nh'], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let stdout = '';
    
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        const processName = stdout.split(',')[0]?.replace(/"/g, '') || 'Unknown';
        resolve(processName);
      } else {
        resolve('Unknown');
      }
    });
    
    child.on('error', () => {
      resolve('Unknown');
    });
  });
}

async function getActivePorts(): Promise<Port[]> {
  try {
    console.log('🔍 Starting port detection...');
    const stdout = await runNetstat();
    console.log('✅ Got netstat output, length:', stdout.length);
    
    const lines = stdout.split('\n').filter(line => line.trim() && line.includes('LISTENING'));
    console.log('📊 Found', lines.length, 'LISTENING lines');
    
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
              const processInfo = await getProcessName(pid);
              
              ports.push({
                pid,
                port: portNum,
                protocol,
                status: 'LISTENING',
                name: processInfo
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