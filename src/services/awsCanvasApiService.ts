import axios, { AxiosInstance } from 'axios';
// Directly import the types needed
import { CanvasAssignment, CanvasFile, CanvasCourse } from './canvasApiService';

// Re-exporting interfaces from original service to avoid duplication
// export type { CanvasAssignment, CanvasFile, CanvasCourse } from './canvasApiService'; // Removed this line

const awsCanvasApiUrl = process.env.AWS_CANVAS_API_URL;
const awsCanvasApiToken = process.env.AWS_CANVAS_API_TOKEN;

if (!awsCanvasApiUrl || !awsCanvasApiToken) {
  throw new Error('AWS Canvas API URL or Token is missing from environment variables.');
}

// Create an Axios instance pre-configured for AWS Canvas API calls
const awsCanvasApiClient: AxiosInstance = axios.create({
  baseURL: `${awsCanvasApiUrl.replace(/\/+$/, '')}/api/v1`,
  headers: {
    Authorization: `Bearer ${awsCanvasApiToken}`,
  },
});

/**
 * Fetches details for a specific assignment from AWS Canvas.
 * @param courseId - The ID of the course.
 * @param assignmentId - The ID of the assignment.
 * @returns A promise that resolves to the assignment details.
 */
export const getAwsAssignment = async (
    courseId: number | string,
    assignmentId: number | string
): Promise<CanvasAssignment> => {
  try {
    const response = await awsCanvasApiClient.get<CanvasAssignment>(`/courses/${courseId}/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error(`AWS: Error fetching assignment ${assignmentId} for course ${courseId}:`, error);
    if (axios.isAxiosError(error)) {
        console.error('AWS Axios error details:', error.response?.data);
        throw new Error(`AWS Canvas API error: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
    }
    throw new Error('Failed to fetch assignment from AWS Canvas API.');
  }
};

/**
 * Fetches a list of files for a specific course from AWS Canvas.
 * @param courseId - The ID of the course.
 * @returns A promise that resolves to an array of file details.
 */
export const getAwsCourseFiles = async (
    courseId: number | string
): Promise<CanvasFile[]> => {
    try {
        const response = await awsCanvasApiClient.get<CanvasFile[]>(`/courses/${courseId}/files`);
        return response.data;
    } catch (error) {
        console.error(`AWS: Error fetching files for course ${courseId}:`, error);
        if (axios.isAxiosError(error)) {
            console.error('AWS Axios error details:', error.response?.data);
            throw new Error(`AWS Canvas API error: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
        }
        throw new Error('Failed to fetch files from AWS Canvas API.');
    }
};

/**
 * Fetches a list of the user's currently active courses from AWS Canvas.
 * @returns A promise that resolves to an array of course details.
 */
export const getAwsCourses = async (): Promise<CanvasCourse[]> => {
    try {
        const response = await awsCanvasApiClient.get<CanvasCourse[]>('/courses', {
            params: { enrollment_state: 'active' }
        });
        return response.data;
    } catch (error) {
        console.error(`AWS: Error fetching courses:`, error);
        if (axios.isAxiosError(error)) {
            console.error('AWS Axios error details:', error.response?.data);
            throw new Error(`AWS Canvas API error: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
        }
        throw new Error('Failed to fetch courses from AWS Canvas API.');
    }
};

/**
 * Fetches a list of assignments for a specific course from AWS Canvas.
 * @param courseId - The ID of the course.
 * @returns A promise that resolves to an array of assignment details.
 */
export const getAwsAssignments = async (
    courseId: number | string
): Promise<CanvasAssignment[]> => {
    try {
        const response = await awsCanvasApiClient.get<CanvasAssignment[]>(`/courses/${courseId}/assignments`);
        return response.data;
    } catch (error) {
        console.error(`AWS: Error fetching assignments for course ${courseId}:`, error);
        if (axios.isAxiosError(error)) {
            console.error('AWS Axios error details:', error.response?.data);
            throw new Error(`AWS Canvas API error: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
        }
        throw new Error('Failed to fetch assignments from AWS Canvas API.');
    }
};

/**
 * Fetches metadata for a specific file from AWS Canvas.
 * @param fileId - The ID of the file.
 * @returns A promise that resolves to the file metadata.
 */
export const getAwsFileDetails = async (
    fileId: number | string
): Promise<CanvasFile> => {
    try {
        const response = await awsCanvasApiClient.get<CanvasFile>(`/files/${fileId}`);
        return response.data;
    } catch (error) {
        console.error(`AWS: Error fetching details for file ${fileId}:`, error);
        if (axios.isAxiosError(error)) {
            console.error('AWS Axios error details:', error.response?.data);
            if (error.response?.status === 404) {
                 throw new Error(`AWS: File not found (ID: ${fileId}).`);
            }
            throw new Error(`AWS Canvas API error fetching file details: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
        }
        throw new Error('AWS: Failed to fetch file details from Canvas API.');
    }
}; 