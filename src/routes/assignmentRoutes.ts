import { Router } from 'express';
import * as assignmentController from '../controllers/assignmentController';

const router = Router();

// GET /api/courses/:courseId/assignments
router.get(
    '/courses/:courseId/assignments',
    assignmentController.handleListAssignments
);

// GET /api/courses/:courseId/assignments/:assignmentId
router.get(
    '/courses/:courseId/assignments/:assignmentId',
    assignmentController.handleGetAssignmentDetails
);

// TODO: Add routes for other assignment-related features

export default router; 