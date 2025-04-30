import { Tool, ToolExecutionRequest, ToolExecutionResponse } from '../types/tools';
import { createCanvasClient, CanvasCredentials } from './canvasService';

// In-memory registry of available tools
// In a production app, this might be loaded from a database or config files
const tools: Tool[] = [
  {
    id: 'get-courses',
    name: 'Get Courses',
    description: 'Retrieves courses from Canvas LMS',
    parameters: [
      {
        name: 'limit',
        description: 'Maximum number of courses to return',
        type: 'number',
        required: false
      }
    ]
  },
  {
    id: 'get-assignments',
    name: 'Get Assignments',
    description: 'Retrieves assignments for a specific course',
    parameters: [
      {
        name: 'courseId',
        description: 'ID of the course',
        type: 'string',
        required: true
      }
    ]
  }
  // Add more tools as needed
];

/**
 * Get all available tools without requiring authentication
 */
export const getAllTools = (): Tool[] => {
  return tools;
};

/**
 * Get a specific tool by ID
 */
export const getToolById = (id: string): Tool | undefined => {
  return tools.find(tool => tool.id === id);
};

/**
 * Execute a tool with the given parameters
 * This is where lazy loading of authentication happens
 */
export const executeTool = async (
  request: ToolExecutionRequest
): Promise<ToolExecutionResponse> => {
  try {
    const tool = getToolById(request.toolId);
    
    if (!tool) {
      return {
        success: false,
        error: `Tool with ID ${request.toolId} not found`
      };
    }
    
    // Validate required parameters
    const missingParams = tool.parameters
      .filter(param => param.required)
      .filter(param => !(param.name in request.parameters))
      .map(param => param.name);
    
    if (missingParams.length > 0) {
      return {
        success: false,
        error: `Missing required parameters: ${missingParams.join(', ')}`
      };
    }
    
    // LAZY AUTHENTICATION:
    // Only when executing a tool do we check for and use authentication
    if (!request.authentication || !request.authentication.apiKey || !request.authentication.domain) {
      return {
        success: false,
        error: 'Canvas LMS API key and domain are required for authentication'
      };
    }
    
    const canvasCredentials: CanvasCredentials = {
      apiKey: request.authentication.apiKey,
      domain: request.authentication.domain
    };
    
    try {
      // Create the Canvas client only when we need it
      const canvasClient = createCanvasClient(canvasCredentials);
      
      let result;
      switch (request.toolId) {
        case 'get-courses':
          result = await canvasClient.getCourses(request.parameters.limit);
          break;
          
        case 'get-assignments':
          result = await canvasClient.getAssignments(request.parameters.courseId);
          break;
          
        default:
          return {
            success: false,
            error: `Implementation for tool ${request.toolId} not found`
          };
      }
      
      return {
        success: true,
        result
      };
    } catch (error) {
      // Handle errors from Canvas API client
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Canvas API error'
      };
    }
    
  } catch (error) {
    console.error("Tool execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Helper function (not implemented) that would create an authenticated client
// This would only be called when actually executing a tool, not when listing tools
// const createCanvasClient = (auth?: Record<string, string>) => {
//   // Validate auth, create and return a client
//   // This would use the authentication info to create a client
//   // that can interact with Canvas LMS API
// }; 