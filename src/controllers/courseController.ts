import { Request, Response, NextFunction } from 'express';
import * as canvasApiService from '../services/canvasApiService';

/**
 * Controller function to list active courses.
 */
export const handleListCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const courses = await canvasApiService.getCourses();
        // Optionally filter/map the response to only send necessary fields (id, name)
        const responseData = courses.map(course => ({ 
            id: course.id, 
            name: course.name, 
            course_code: course.course_code
        }));
        res.status(200).json(responseData);
    } catch (error) {
        next(error); // Pass error to global handler
    }
}; 