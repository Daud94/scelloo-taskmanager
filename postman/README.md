# Scelloo Task Manager API - Postman Collection

This directory contains Postman collection and environment files for testing the Scelloo Task Manager API.

## Files

- `scelloo-taskmanager.postman_collection.json` - The Postman collection containing all API endpoints
- `scelloo-taskmanager.postman_environment.json` - The Postman environment file with variables

## How to Use

### Importing the Collection and Environment

1. Open Postman
2. Click on "Import" in the top left corner
3. Drag and drop both files or use the file browser to select them
4. Click "Import" to add them to your Postman workspace

### Setting Up the Environment

1. In the top right corner of Postman, click on the environment dropdown
2. Select "Scelloo Task Manager - Local" from the list
3. The `baseUrl` variable is pre-configured to `http://localhost:3000`. Update this if your API is running on a different URL.

### Authentication Flow

1. First, use the "Register User" request to create a new user account
2. Then, use the "Login" request to authenticate and get a token
   - The login request includes a test script that automatically saves the token to the `authToken` environment variable
3. All other requests will automatically use this token for authentication

### Testing Endpoints

The collection is organized into folders:

1. **Authentication** - Contains endpoints for user registration, login, and getting user information
2. **Tasks** - Contains endpoints for managing tasks and generating reports

Each request includes:
- Appropriate HTTP method
- Required headers
- Example request body (for POST/PUT requests)
- Path and query parameters (where applicable)
- Descriptions explaining the purpose of each endpoint

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get authentication token
- `GET /auth/me` - Get current user information

### Tasks

- `POST /tasks` - Create a new task
- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get a specific task by ID
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task
- `GET /tasks/report-time` - Generate a report on time spent on tasks
- `GET /tasks/reports` - Generate a report on task completion rates

## Notes

- The authentication token is automatically saved when you login
- Admin users can see and manage all tasks, while regular users can only see and manage their own tasks
- For report endpoints, you can specify date ranges using the `startDate` and `endDate` query parameters