import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Basic interface for a Canvas Assignment (add more fields as needed)
export interface CanvasAssignment {
  id: number;
  name: string;
  description: string | null;
  due_at: string | null;
  points_possible: number | null;
  course_id: number;
  // Add other relevant fields from Canvas API documentation
}

// Basic interface for a Canvas File (add more fields as needed)
export interface CanvasFile {
    id: number;
    display_name: string;
    url: string;
    size: number;
    content_type: string;
    // Add other relevant fields
}

// Basic interface for a Canvas Course (add more fields as needed)
export interface CanvasCourse {
    id: number;
    name: string;
    course_code: string;
    // Add other relevant fields
}

// Interface for a Canvas Discussion Topic
export interface CanvasDiscussionTopic {
    id: number;
    title: string;
    message: string; // The HTML content of the topic's description
    url: string;
    read_state: string;
    last_reply_at: string | null;
    // Add other fields like user_name, posted_at etc. if needed
}

// Interface for a Canvas Discussion Entry (a post within a topic)
export interface CanvasDiscussionEntry {
    id: number;
    user_id: number;
    user_name: string;
    message: string; // HTML content of the post
    read_state: string;
    created_at: string;
    // replies?: CanvasDiscussionEntry[]; // If fetching nested replies is needed
}

// Interface for the response from the /view endpoint (includes topic & entries)
interface CanvasDiscussionTopicView extends CanvasDiscussionTopic {
    view: CanvasDiscussionEntry[]; // The first page of entries
    participants: any[]; // Simplified for now
    // Potentially other fields like unread_count
}

const canvasApiUrl = process.env.CANVAS_API_URL;
const canvasApiToken = process.env.CANVAS_API_TOKEN;

if (!canvasApiUrl || !canvasApiToken) {
  throw new Error('Canvas API URL or Token is missing from environment variables.');
}

// Create an Axios instance pre-configured for Canvas API calls
const canvasApiClient: AxiosInstance = axios.create({
  baseURL: `${canvasApiUrl.replace(/\/+$/, '')}/api/v1`,
  headers: {
    Authorization: `Bearer ${canvasApiToken}`,
  },
});

/**
 * Fetches details for a specific assignment.
 * @param courseId - The ID of the course.
 * @param assignmentId - The ID of the assignment.
 * @returns A promise that resolves to the assignment details.
 */
export const getAssignment = async (
    courseId: number | string,
    assignmentId: number | string
): Promise<CanvasAssignment> => {
  try {
    const response = await canvasApiClient.get<CanvasAssignment>(`/courses/${courseId}/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching assignment ${assignmentId} for course ${courseId}:`, error);
    // Rethrow or handle specific errors as needed
    if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
        throw new Error(`Canvas API error: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
    }
    throw new Error('Failed to fetch assignment from Canvas API.');
  }
};

/**
 * Fetches a list of files for a specific course.
 * @param courseId - The ID of the course.
 * @returns A promise that resolves to an array of file details.
 */
export const getCourseFiles = async (
    courseId: number | string
): Promise<CanvasFile[]> => {
    try {
        // Note: This might require pagination handling for courses with many files.
        const response = await canvasApiClient.get<CanvasFile[]>(`/courses/${courseId}/files`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching files for course ${courseId}:`, error);
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', error.response?.data);
            throw new Error(`Canvas API error: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
        }
        throw new Error('Failed to fetch files from Canvas API.');
    }
};

/**
 * Fetches a list of the user's currently active courses.
 * @returns A promise that resolves to an array of course details.
 */
export const getCourses = async (): Promise<CanvasCourse[]> => {
    try {
        // Note: Fetches only the first page. Add pagination if needed.
        // We add enrollment_state=active to filter for courses the user is currently in.
        const response = await canvasApiClient.get<CanvasCourse[]>('/courses', {
            params: { enrollment_state: 'active' }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching courses:`, error);
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', error.response?.data);
            throw new Error(`Canvas API error: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
        }
        throw new Error('Failed to fetch courses from Canvas API.');
    }
};

/**
 * Fetches a list of assignments for a specific course.
 * @param courseId - The ID of the course.
 * @returns A promise that resolves to an array of assignment details.
 */
export const getAssignments = async (
    courseId: number | string
): Promise<CanvasAssignment[]> => {
    try {
        // Note: Fetches only the first page. Add pagination if needed.
        const response = await canvasApiClient.get<CanvasAssignment[]>(`/courses/${courseId}/assignments`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching assignments for course ${courseId}:`, error);
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', error.response?.data);
            throw new Error(`Canvas API error: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
        }
        throw new Error('Failed to fetch assignments from Canvas API.');
    }
};

// Helper function to handle Canvas API pagination (follows Link header)
const fetchAllPaginatedData = async <T>(initialUrl: string): Promise<T[]> => {
    let results: T[] = [];
    let nextUrl: string | null = initialUrl;

    while (nextUrl) {
        try {
            const response: AxiosResponse<T[]> = await canvasApiClient.get<T[]>(nextUrl);
            results = results.concat(response.data);

            // Check for Link header for pagination
            const linkHeader: string | string[] | undefined = response.headers['link'];
            nextUrl = null; // Assume no next page unless found
            
            if (typeof linkHeader === 'string') { 
                const links: string[] = linkHeader.split(',');
                const nextLink: string | undefined = links.find((link: string) => link.includes('rel="next"'));
                if (nextLink) {
                    const match: RegExpMatchArray | null = nextLink.match(/<([^>]+)>/);
                    if (match && match[1]) {
                        nextUrl = match[1];
                    }
                }
            } else if (Array.isArray(linkHeader)) {
                const nextLinkHeader = linkHeader.find((link: string) => link.includes('rel="next"'));
                 if (nextLinkHeader) {
                    const match: RegExpMatchArray | null = nextLinkHeader.match(/<([^>]+)>/);
                    if (match && match[1]) {
                        nextUrl = match[1];
                    }
                 }
            }
        } catch (error) {
            console.error(`Error during pagination for URL ${nextUrl}:`, error);
            if (axios.isAxiosError(error)) {
                console.error('Axios error details:', error.response?.data);
                throw new Error(`Canvas API pagination error: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
            }
            throw new Error('Failed during Canvas API pagination.');
        }
    }
    return results;
};

/**
 * Fetches a list of discussion topics for a specific course.
 * @param courseId - The ID of the course.
 * @returns A promise that resolves to an array of discussion topics.
 */
export const getDiscussionTopics = async (
    courseId: number | string
): Promise<CanvasDiscussionTopic[]> => {
    try {
        // Note: This might require pagination for courses with many topics.
        const url = `/courses/${courseId}/discussion_topics`;
        // Using the pagination helper, although unlikely needed for top-level topics list often
        const topics = await fetchAllPaginatedData<CanvasDiscussionTopic>(url);
        return topics;
    } catch (error) {
        console.error(`Error fetching discussion topics for course ${courseId}:`, error);
        // Error already includes details from fetchAllPaginatedData if it failed there
        if (!(error instanceof Error && error.message.includes('Canvas API pagination error'))) {
            // Handle specific error if not from pagination helper
             if (axios.isAxiosError(error)) {
                console.error('Axios error details:', error.response?.data);
                throw new Error(`Canvas API error fetching topics: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
            }
            throw new Error('Failed to fetch discussion topics from Canvas API.');
        }
        throw error; // Re-throw pagination error
    }
};

/**
 * Fetches a specific discussion topic and *all* its entries (handling pagination).
 * @param courseId - The ID of the course.
 * @param topicId - The ID of the discussion topic.
 * @returns A promise that resolves to the discussion topic view including all entries.
 */
export const getDiscussionTopicWithEntries = async (
    courseId: number | string,
    topicId: number | string
): Promise<CanvasDiscussionTopicView> => {
    try {
        // 1. Fetch the initial topic view (includes first page of entries)
        const initialViewResponse: AxiosResponse<CanvasDiscussionTopicView> = await canvasApiClient.get<CanvasDiscussionTopicView>(`/courses/${courseId}/discussion_topics/${topicId}/view`);
        const topicView = initialViewResponse.data;

        // 2. Check pagination for entries from the initial view
        const linkHeader: string | string[] | undefined = initialViewResponse.headers['link'];
        let nextEntriesUrl: string | null = null;
        
        if (typeof linkHeader === 'string') { 
            const links: string[] = linkHeader.split(',');
            // Look for the *entries* next link within the view response headers
            const nextLink: string | undefined = links.find((link: string) => link.includes('rel="next"')); 
             if (nextLink) {
                 const match: RegExpMatchArray | null = nextLink.match(/<([^>]+)>/);
                 // Check if this next link is specifically for entries (often contains /entries/)
                 // This check might need refinement based on actual header format
                 if (match && match[1] /*&& match[1].includes('/entries')*/) { // Relaxed check slightly, as URL structure might vary
                    nextEntriesUrl = match[1];
                 }
             }
        } else if (Array.isArray(linkHeader)) {
             const nextLinkHeader = linkHeader.find((link: string) => link.includes('rel="next"'));
             if (nextLinkHeader) {
                 const match: RegExpMatchArray | null = nextLinkHeader.match(/<([^>]+)>/);
                 if (match && match[1] /*&& match[1].includes('/entries')*/) { 
                     nextEntriesUrl = match[1];
                 }
             }
        }

        // 3. If there's a next page URL for entries, fetch the rest
        let remainingEntries: CanvasDiscussionEntry[] = [];
        if (nextEntriesUrl) {
             console.log(`Fetching remaining discussion entries starting from: ${nextEntriesUrl}`);
            remainingEntries = await fetchAllPaginatedData<CanvasDiscussionEntry>(nextEntriesUrl);
        }

        // 4. Combine initial entries with remaining entries
        topicView.view = topicView.view.concat(remainingEntries);

        return topicView;

    } catch (error) {
        console.error(`Error fetching discussion topic view for topic ${topicId}, course ${courseId}:`, error);
         if (axios.isAxiosError(error) && !(error instanceof Error && error.message.includes('Canvas API pagination error'))) {
             console.error('Axios error details:', error.response?.data);
             throw new Error(`Canvas API error fetching topic view: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
         }
        // Re-throw pagination errors or other errors
        throw error;
    }
};

/**
 * Fetches metadata for a specific file.
 * @param fileId - The ID of the file.
 * @returns A promise that resolves to the file metadata (including download URL).
 */
export const getFileDetails = async (
    fileId: number | string
): Promise<CanvasFile> => {
    try {
        const response = await canvasApiClient.get<CanvasFile>(`/files/${fileId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for file ${fileId}:`, error);
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', error.response?.data);
            // Handle 404 specifically maybe?
            if (error.response?.status === 404) {
                 throw new Error(`File not found (ID: ${fileId}).`);
            }
            throw new Error(`Canvas API error fetching file details: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
        }
        throw new Error('Failed to fetch file details from Canvas API.');
    }
};

// TODO: Add more functions as needed (e.g., getFileContent, getPages, getRubric, etc.)
