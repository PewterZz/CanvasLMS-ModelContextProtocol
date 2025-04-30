// Basic type definitions for Canvas objects used in services.
// These can be expanded based on actual API responses.

export interface RubricCriterion {
    id: number | string;
    description?: string;
    long_description?: string;
    points?: number;
    ratings?: any[]; // Define rating structure if needed
    // ... other criterion properties
}

export interface Rubric {
    id: number;
    title?: string;
    course_id?: number;
    assignment_id?: number;
    points_possible?: number;
    free_form_criterion_comments?: boolean;
    // 'data' often contains the criteria, but sometimes it's a separate field
    data?: RubricCriterion[];
    criteria?: RubricCriterion[];
    // ... other rubric properties
}

export interface RubricSettings {
    id: number;
    points_possible?: number;
    // ... other rubric settings properties
}

export interface Assignment {
    id: number | string;
    name?: string;
    description?: string;
    course_id?: number | string;
    // If a rubric is directly associated, it might be nested
    rubric?: Rubric | any; // Use 'any' if structure varies or is just ID
    rubric_settings?: RubricSettings | any;
    use_rubric_for_grading?: boolean;
    // ... other assignment properties
}

// Add other Canvas types as needed (e.g., Submission, Course, DiscussionTopic, File)

export interface Submission {
    id: number;
    user_id: number;
    assignment_id: number;
    grade?: string | null;
    score?: number | null;
    graded_at?: string | null;
    submitted_at?: string | null;
    // ... other submission properties
} 