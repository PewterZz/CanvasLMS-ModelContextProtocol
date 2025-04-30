import { Request, Response, NextFunction } from 'express';
// Use the AWS-specific service
import * as awsCanvasApiService from '../services/awsCanvasApiService'; 

/**
 * Controller function to list active AWS courses.
 */
export const handleListAwsCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const courses = await awsCanvasApiService.getAwsCourses();
        const responseData = courses.map(course => ({ 
            id: course.id, 
            name: course.name, 
            course_code: course.course_code
        }));
        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
}; 