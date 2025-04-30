import { Request, Response, NextFunction } from 'express';
import * as canvasApiService from '../services/canvasApiService';

/**
 * Controller function to list discussion topics for a course.
 */
export const handleListDiscussionTopics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { courseId } = req.params;

    if (!courseId) {
        res.status(400).json({ message: 'Missing courseId in request parameters.' });
        return;
    }

    try {
        const topics = await canvasApiService.getDiscussionTopics(courseId);
        // Map to simpler response if needed
        const responseData = topics.map(topic => ({ 
            id: topic.id, 
            title: topic.title,
            url: topic.url,
            last_reply_at: topic.last_reply_at
        }));
        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
};

/**
 * Controller function to get details and all entries for a specific discussion topic.
 */
export const handleGetDiscussionTopicDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { courseId, topicId } = req.params;

    if (!courseId || !topicId) {
        res.status(400).json({ message: 'Missing courseId or topicId in request parameters.' });
        return;
    }

    try {
        const topicView = await canvasApiService.getDiscussionTopicWithEntries(courseId, topicId);
        // Optionally simplify the response object
        const responseData = {
            id: topicView.id,
            title: topicView.title,
            message: topicView.message, // Original topic message
            url: topicView.url,
            entries: topicView.view.map(entry => ({ // Map entries to simpler format
                id: entry.id,
                user_id: entry.user_id,
                user_name: entry.user_name,
                created_at: entry.created_at,
                message: entry.message // Entry message
            }))
        };
        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
}; 