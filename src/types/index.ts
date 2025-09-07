export interface Port {
  pid: string;
  port: string;
  protocol: string;
  status: string;
  name: string;
}

export interface KillResponse {
  success: boolean;
  message?: string;
  error?: string;
  output?: string;
}