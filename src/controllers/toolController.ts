import { Request, Response } from 'express';
import { getAllTools, getToolById, executeTool } from '../services/toolService';
import { ToolExecutionRequest } from '../types/tools';

/**
 * List all available tools
 * This endpoint is accessible without authentication
 */
export const listTools = (req: Request, res: Response) => {
  try {
    const tools = getAllTools();
    return res.status(200).json({
      success: true,
      data: tools
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
};

/**
 * Get details for a specific tool
 * This endpoint is also accessible without authentication
 */
export const getTool = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tool = getToolById(id);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: `Tool with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: tool
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
};

/**
 * Execute a specific tool
 * This endpoint requires authentication details in the request
 */
export const runTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { parameters, authentication } = req.body;
    
    // Validate request body
    if (!parameters || typeof parameters !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Parameters object is required'
      });
    }
    
    const executionRequest: ToolExecutionRequest = {
      toolId: id,
      parameters,
      authentication
    };
    
    const result = await executeTool(executionRequest);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}; 