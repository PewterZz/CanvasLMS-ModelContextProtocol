import { Router } from 'express';
import * as discussionController from '../controllers/discussionController';

const router = Router();

// Route to list discussion topics for a course
// GET /api/courses/:courseId/discussions
router.get(
    '/courses/:courseId/discussions',
    discussionController.handleListDiscussionTopics
);

// Route to get details and all entries for a specific discussion topic
// GET /api/courses/:courseId/discussions/:topicId
router.get(
    '/courses/:courseId/discussions/:topicId',
    discussionController.handleGetDiscussionTopicDetails
);

export default router; 