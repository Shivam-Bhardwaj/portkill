import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { pid, port } = await request.json();
    
    if (!pid || !port) {
      return NextResponse.json({ error: 'PID and port are required' }, { status: 400 });
    }
    
    const { stdout } = await execAsync(`taskkill /PID ${pid} /F`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully killed process ${pid} on port ${port}`,
      output: stdout 
    });
  } catch (error: unknown) {
    console.error('Error killing process:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 128) {
      return NextResponse.json({ 
        error: 'Process not found or already terminated',
        success: false 
      }, { status: 404 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: `Failed to kill process: ${errorMessage}`,
      success: false 
    }, { status: 500 });
  }
}