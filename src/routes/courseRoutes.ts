import { Router } from 'express';
import * as courseController from '../controllers/courseController';

const router = Router();

// Define the route for listing active courses
// GET /api/courses
router.get('/courses', courseController.handleListCourses);

// TODO: Add other course-related routes if needed

export default router; 