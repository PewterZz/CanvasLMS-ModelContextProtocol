import { Router } from 'express';
// Use the AWS-specific controller
import * as awsAssignmentController from '../controllers/awsAssignmentController';

const router = Router();

// GET /courses/:courseId/assignments
router.get(
    '/courses/:courseId/assignments',
    awsAssignmentController.handleListAwsAssignments
);

// GET /courses/:courseId/assignments/:assignmentId
router.get(
    '/courses/:courseId/assignments/:assignmentId',
    awsAssignmentController.handleGetAwsAssignmentDetails
);

// Summarize route removed

export default router; 