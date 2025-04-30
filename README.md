# Canvas LMS MCP Server

This server acts as a backend proxy and utility layer for interacting with Canvas LMS instances, providing processed data intended for consumption by Language Models (LLMs) or other applications.

It allows fetching course details, assignment information (including descriptions and attached file links/content), discussion topics, and extracting text from PDF files hosted on Canvas.

## Setup

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd CanvasMCP
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the project root and add the following variables. Replace the placeholder values with your actual Canvas credentials.

    ```env
    # Standard Canvas Instance
    CANVAS_API_URL=https://your-canvas-domain.instructure.com
    CANVAS_API_TOKEN=your_standard_canvas_api_token

    # AWS Hosted Canvas Instance (if applicable)
    AWS_CANVAS_API_URL=https://your-aws-canvas-domain.instructure.com
    AWS_CANVAS_API_TOKEN=your_aws_canvas_api_token

    # Server Port (Optional, defaults to 3000)
    PORT=3000
    ```

4.  **Run the Server:**
    *   For development (with auto-reloading): `npm run dev`
    *   For production: `npm start`

The server will be running at `http://localhost:PORT` (e.g., `http://localhost:3000`).

## API Endpoints

All endpoints require the corresponding Canvas API URL and Token to be configured in the `.env` file.

### Health Check

*   **GET /**
    *   **Description:** Checks if the server is running.
    *   **Example:**
        ```bash
        curl http://localhost:3000/
        ```
    *   **Success Response:** `Canvas MCP Server is running!` (Content-Type: text/html)

### Standard Canvas API (`/api/...`)

Uses `CANVAS_API_URL` and `CANVAS_API_TOKEN`.

*   **GET /api/courses/:courseId**
    *   **Description:** Get details for a specific course.
    *   **Path Parameters:**
        *   `:courseId` (number): The ID of the course.
    *   **Example:**
        ```bash
        curl http://localhost:3000/api/courses/12345
        ```
    *   **Success Response (Example):** `{ "id": 12345, "name": "Introduction to Programming", ... }`

*   **GET /api/courses/:courseId/assignments**
    *   **Description:** Get a list of assignments for a specific course.
    *   **Path Parameters:**
        *   `:courseId` (number): The ID of the course.
    *   **Example:**
        ```bash
        curl http://localhost:3000/api/courses/12345/assignments
        ```
    *   **Success Response (Example):** `[ { "id": 987, "name": "Assignment 1", ... }, ... ]`

*   **GET /api/assignments/:courseId/:assignmentId**
    *   **Description:** Get details for a specific assignment.
    *   **Path Parameters:**
        *   `:courseId` (number): The ID of the course.
        *   `:assignmentId` (number): The ID of the assignment.
    *   **Example:**
        ```bash
        curl http://localhost:3000/api/assignments/12345/987
        ```
    *   **Success Response (Example):** `{ "id": 987, "name": "Assignment 1", "description": "...", ... }`

*   **GET /api/assignments/:courseId/:assignmentId/submissions**
    *   **Description:** Get submission details for a specific assignment (requires appropriate permissions).
    *   **Path Parameters:**
        *   `:courseId` (number): The ID of the course.
        *   `:assignmentId` (number): The ID of the assignment.
    *   **Example:**
        ```bash
        curl http://localhost:3000/api/assignments/12345/987/submissions
        ```
    *   **Success Response (Example):** `[ { "user_id": 101, "grade": "A", ... }, ... ]`

*   **GET /api/assignments/:courseId/:assignmentId/description**
    *   **Description:** Get the assignment description along with extracted links to attached files.
    *   **Path Parameters:**
        *   `:courseId` (number): The ID of the course.
        *   `:assignmentId` (number): The ID of the assignment.
    *   **Example:**
        ```bash
        curl http://localhost:3000/api/assignments/12345/987/description
        ```
    *   **Success Response (Example):**
        ```json
        {
          "description": "<p>Please read the attached file.</p><p><a class=\"instructure_file_link\" href=\"/courses/12345/files/44827106/download?download_frd=1\" data-api-endpoint=\"https://rmit.instructure.com/api/v1/courses/12345/files/44827106\" data-api-returntype=\"File\">Instructions.pdf</a></p>",
          "linked_files": [
            {
              "link_text": "Instructions.pdf",
              "file_id": "44827106",
              "download_url": "https://your-canvas-domain.instructure.com/files/44827106/download?download_frd=1"
            }
          ]
        }
        ```

*   **GET /api/discussions/:courseId/:discussionTopicId**
    *   **Description:** Get details for a specific discussion topic.
    *   **Path Parameters:**
        *   `:courseId` (number): The ID of the course.
        *   `:discussionTopicId` (number): The ID of the discussion topic.
    *   **Example:**
        ```bash
        curl http://localhost:3000/api/discussions/12345/678
        ```
    *   **Success Response (Example):** `{ "id": 678, "title": "Week 1 Discussion", "message": "...", ... }`

### PDF Tools (`/api/pdf/...`)

Uses `CANVAS_API_URL` and `CANVAS_API_TOKEN`.

*   **POST /api/pdf/extract-text**
    *   **Description:** Downloads a PDF file from Canvas using its file ID and extracts the text content.
    *   **Request Body:** `application/json`
        ```json
        {
          "fileId": 44827106
        }
        ```
    *   **Example:**
        ```bash
        curl -X POST \
          http://localhost:3000/api/pdf/extract-text \
          -H 'Content-Type: application/json' \
          -d '{"fileId": 44827106}'
        ```
    *   **Success Response (Example):**
        ```json
        {
          "text": "This is the extracted text content from the PDF...\nPage 2 content..."
        }
        ```
    *   **Error Responses:**
        *   `400 Bad Request`: Missing or invalid `fileId`.
        *   `401 Unauthorized / 404 Not Found`: Invalid API token, insufficient permissions, or file ID not found (check server logs for details from Canvas API).
        *   `500 Internal Server Error`: Server configuration error (missing .env variables), failed to download, or failed to parse PDF.

### Grades

Grade information for individual assignments is retrieved via the Submissions endpoint:

*   **GET /api/assignments/:courseId/:assignmentId/submissions**
    *   **Description:** Get submission details for a specific assignment, including grades (`grade`, `score`) for each submission.
    *   *(See full description under Standard Canvas API)*

### AWS Canvas API (`/api/aws/...`)

Uses `AWS_CANVAS_API_URL` and `AWS_CANVAS_API_TOKEN`.

These endpoints mirror the standard Canvas API endpoints but target the AWS-hosted instance defined in the `.env` file.

*   **GET /api/aws/courses/:courseId**
*   **GET /api/aws/courses/:courseId/assignments**
*   **GET /api/aws/assignments/:courseId/:assignmentId**
*   **GET /api/aws/assignments/:courseId/:assignmentId/description**
    *   *(Note: The file download links returned here will point to the AWS Canvas instance)*

*   **GET /api/aws/assignments/:courseId/:assignmentId/submissions** *(Provides AWS grades)*

*(Usage and responses are analogous to the standard API endpoints above, but using the `/api/aws` prefix and the AWS Canvas credentials.)*

## Error Handling

The server includes a global error handler. Most errors originating from the Canvas API or internal processing will return a JSON response with an `error` object containing a `message` field:

```json
{
  "error": {
    "message": "Specific error details here..."
  }
}
```

Check the server console logs for more detailed stack traces and debugging information. 
