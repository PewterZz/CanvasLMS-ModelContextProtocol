import axios, { AxiosInstance } from 'axios';

export interface CanvasCredentials {
  apiKey: string;
  domain: string;
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  // Add other fields as needed
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number;
  // Add other fields as needed
}

/**
 * Creates an authenticated Canvas LMS API client
 * This is only called when a tool is actually executed, not when listing tools
 */
export const createCanvasClient = (credentials: CanvasCredentials): CanvasClient => {
  if (!credentials || !credentials.apiKey || !credentials.domain) {
    throw new Error('Canvas API key and domain are required');
  }
  
  return new CanvasClient(credentials);
};

/**
 * Canvas LMS API Client
 * This is created on-demand when a tool is executed, not at server startup
 */
class CanvasClient {
  private client: AxiosInstance;
  private baseUrl: string;
  
  constructor(credentials: CanvasCredentials) {
    this.baseUrl = `https://${credentials.domain}/api/v1`;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
  }
  
  /**
   * Get courses
   */
  async getCourses(limit?: number): Promise<CanvasCourse[]> {
    try {
      const response = await this.client.get('/courses', {
        params: {
          per_page: limit || 10
        }
      });
      
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      // This line won't be reached because handleApiError always throws
      return [];
    }
  }
  
  /**
   * Get assignments for a course
   */
  async getAssignments(courseId: string | number): Promise<CanvasAssignment[]> {
    try {
      const response = await this.client.get(`/courses/${courseId}/assignments`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      // This line won't be reached because handleApiError always throws
      return [];
    }
  }
  
  /**
   * Handle API errors in a consistent way
   */
  private handleApiError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 401) {
        throw new Error(`Canvas API authentication failed: ${message}`);
      } else if (status === 403) {
        throw new Error(`Canvas API permission denied: ${message}`);
      } else if (status === 404) {
        throw new Error(`Canvas API resource not found: ${message}`);
      } else {
        throw new Error(`Canvas API error (${status || 'unknown'}): ${message}`);
      }
    }
    
    throw error instanceof Error ? error : new Error(String(error));
  }
} 