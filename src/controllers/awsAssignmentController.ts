import { Request, Response, NextFunction } from 'express';
// Use the AWS-specific service
import * as awsCanvasApiService from '../services/awsCanvasApiService'; 
// OpenAI import already removed

/**
 * Controller function to list assignments for an AWS course.
 */
export const handleListAwsAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { courseId } = req.params;

    if (!courseId) {
        res.status(400).json({ message: 'Missing courseId in request parameters.' });
        return;
    }

    try {
        const assignments = await awsCanvasApiService.getAwsAssignments(courseId);
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

/**
 * Controller function to get full details for a specific AWS assignment.
 */
export const handleGetAwsAssignmentDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { courseId, assignmentId } = req.params;

    if (!courseId || !assignmentId) {
        res.status(400).json({ message: 'Missing courseId or assignmentId in request parameters.' });
        return;
    }

    try {
        // Fetch the full assignment details from AWS Canvas
        const assignment = await awsCanvasApiService.getAwsAssignment(courseId, assignmentId);

        // --- Find linked files --- 
        const linkedFiles: { id: number, name: string, content_type: string }[] = [];
        if (assignment.description) {
            // console.log('--- DEBUG AWS: Assignment Description (for link parsing) ---');
            // console.log(assignment.description);
            // console.log('--- END DEBUG AWS: Assignment Description ---');
            
            const foundFileIds = new Set<string>(); 

            // 1. Find all anchor tags and extract hrefs
            const anchorTagRegex = /<a\s+[^>]*?href="([^"]+)"[^>]*?>/gi;
            let anchorMatch;
            
            // console.log('--- DEBUG AWS: Finding Anchor Tags ---');
            while ((anchorMatch = anchorTagRegex.exec(assignment.description)) !== null) {
                const hrefValue = anchorMatch[1]; 
                // console.log(`--- DEBUG AWS: Found href: ${hrefValue} ---`);

                // 2. Apply simpler regex to the extracted href value
                const fileIdRegex = /\/files\/(\d+)/; 
                const fileIdMatch = hrefValue.match(fileIdRegex);

                if (fileIdMatch && fileIdMatch[1]) {
                    const fileId = fileIdMatch[1];
                    // console.log(`--- DEBUG AWS: Extracted File ID from href: ${fileId} ---`);
                    
                    if (!foundFileIds.has(fileId)) {
                        foundFileIds.add(fileId);
                        try {
                            const fileDetails = await awsCanvasApiService.getAwsFileDetails(fileId);
                            linkedFiles.push({
                                id: fileDetails.id,
                                name: fileDetails.display_name,
                                content_type: fileDetails.content_type
                            });
                             // console.log(`--- DEBUG AWS: Added file ${fileId} (${fileDetails.display_name}) to linked_files ---`);
                        } catch (fileError) {
                            console.warn(`AWS: Could not fetch details for linked file ID ${fileId} in assignment ${assignmentId}:`, fileError);
                        }
                    }
                }
            }
            // console.log('--- DEBUG AWS: Finished Parsing Links ---');
        }
        // --- End find linked files ---

        // Return the assignment object along with the identified linked files
        res.status(200).json({ 
            ...assignment, 
            linked_files: linkedFiles 
         });

    } catch (error) {
        next(error); // Pass errors to the global handler
    }
}; 