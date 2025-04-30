import { Router } from 'express';
// Use the AWS-specific controller
import * as awsCourseController from '../controllers/awsCourseController';

const router = Router();

// Define the route for listing active AWS courses
// GET /courses (prefix /api/aws will be added in server.ts)
router.get('/courses', awsCourseController.handleListAwsCourses);

export default router; 