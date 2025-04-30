export interface ToolParameter {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: ToolParameter[];
}

export interface ToolExecutionRequest {
  toolId: string;
  parameters: Record<string, any>;
  authentication?: Record<string, string>; // Optional authentication credentials
}

export interface ToolExecutionResponse {
  success: boolean;
  result?: any;
  error?: string;
} 