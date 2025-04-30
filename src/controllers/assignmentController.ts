import { Request, Response, NextFunction } from 'express';
import * as canvasApiService from '../services/canvasApiService';
// import * as openaiService from '../services/openaiService'; // Removed OpenAI import

/**
 * Controller function to summarize an assignment.
 */


/**
 * Controller function to list assignments for a course.
 */
export const handleListAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { courseId } = req.params;

    if (!courseId) {
        res.status(400).json({ message: 'Missing courseId in request parameters.' });
        return;
    }

    try {
        const assignments = await canvasApiService.getAssignments(courseId);
        // Optionally filter/map the response
        const responseData = assignments.map(assignment => ({ 
            id: assignment.id, 
            name: assignment.name,
            due_at: assignment.due_at,
            points_possible: assignment.points_possible
        }));
        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
};

// Controller function to get full details for a specific assignment.
export const handleGetAssignmentDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { courseId, assignmentId } = req.params;

    if (!courseId || !assignmentId) {
        res.status(400).json({ message: 'Missing courseId or assignmentId in request parameters.' });
        return;
    }

    try {
        // Fetch the full assignment details
        const assignment = await canvasApiService.getAssignment(courseId, assignmentId);

        // --- Find linked files --- 
        const linkedFiles: { id: number, name: string, content_type: string }[] = [];
        if (assignment.description) {
            // console.log('--- DEBUG: Assignment Description (for link parsing) ---');
            // console.log(assignment.description);
            // console.log('--- END DEBUG: Assignment Description ---');
            
            const foundFileIds = new Set<string>(); // Use a Set to avoid duplicates

            // 1. Find all anchor tags and extract hrefs
            const anchorTagRegex = /<a\s+[^>]*?href="([^"]+)"[^>]*?>/gi;
            let anchorMatch;
            
            // console.log('--- DEBUG: Finding Anchor Tags ---');
            while ((anchorMatch = anchorTagRegex.exec(assignment.description)) !== null) {
                const hrefValue = anchorMatch[1]; // Get the captured href value
                // console.log(`--- DEBUG: Found href: ${hrefValue} ---`);

                // 2. Apply simpler regex to the extracted href value
                const fileIdRegex = /\/files\/(\d+)/; // Simpler regex for just /files/ID
                const fileIdMatch = hrefValue.match(fileIdRegex);

                if (fileIdMatch && fileIdMatch[1]) {
                    const fileId = fileIdMatch[1];
                    // console.log(`--- DEBUG: Extracted File ID from href: ${fileId} ---`);
                    
                    if (!foundFileIds.has(fileId)) {
                        foundFileIds.add(fileId);
                        try {
                            const fileDetails = await canvasApiService.getFileDetails(fileId);
                            linkedFiles.push({
                                id: fileDetails.id,
                                name: fileDetails.display_name,
                                content_type: fileDetails.content_type
                            });
                            // console.log(`--- DEBUG: Added file ${fileId} (${fileDetails.display_name}) to linked_files ---`);
                        } catch (fileError) {
                            console.warn(`Could not fetch details for linked file ID ${fileId} in assignment ${assignmentId}:`, fileError);
                        }
                    }
                }
            }
            // console.log('--- DEBUG: Finished Parsing Links ---');
        }
        // --- End find linked files ---

        // Return the assignment object along with the identified linked files
        res.status(200).json({ 
            ...assignment, // Spread the original assignment object
            linked_files: linkedFiles // Add the array of found files
         });

    } catch (error) {
        next(error); // Pass errors to the global handler
    }
};

// TODO: Add controllers for other assignment-related features (scaffolding, etc.) 