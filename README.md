# Scelloo Task Manager

A RESTful API for managing tasks with user authentication and reporting features. Built with Node.js, Express, and
Sequelize ORM.

## Features

- User registration and login (JWT authentication)
- Role-based access (admin, user)
- CRUD operations for tasks
- Task filtering and reporting (time spent, completion rates)
- Input validation with Joi

## Tech Stack

- Node.js, Express
- Sequelize ORM (PostgreSQL)
- JWT for authentication
- Joi for validation

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Daud94/scelloo-taskmanager.git
   cd scelloo-taskmanager
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
    - Copy `.env.example` to `.env` and set your DB credentials and JWT secret.
4. Run migrations and seed admin user:
   ```bash
   npm run migrate
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run start
   ```

## API Documentation

### Authentication

#### Register

- `POST /auth/register`
- Body:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- Response: `201 Created`

#### Login

- `POST /auth/login`
- Body:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "authToken": "<JWT_TOKEN>"
  }
  ```

#### Get Profile

- `GET /auth/me` (Requires `Authorization: Bearer <token>`)
- Response:
    ```json
    {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
        "user": {
            "id": 1,
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com",
            "userType": "user",
            "createdAt": "2025-05-26T11:51:39.268Z",
            "updatedAt": "2025-05-26T11:51:39.268Z"
        }
    }
  }
    ```

### Tasks

#### Create Task

- `POST /tasks` (Auth required)
- Body:
  ```json
  {
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the project",
    "startDate": "2025-05-26T23:59:59Z",
    "dueDate": "2025-05-28T23:59:59Z"
    }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Task created successfully"
  }
  ```

#### List Tasks

- `GET /tasks?title=...&status=...&startDate=...&endDate=...&page=1&limit=10` (Auth required)
- Supports pagination with the following query parameters:
    - `page` (optional, default: 1): The page number to retrieve.
    - `limit` (optional, default: 10): Number of tasks per page.
- Example paginated response:
  ```json
  {
    "success": true,
    "message": "Tasks retrieved successfully",
    "data": {
        "totalItems": 1,
        "totalPages": 1,
        "page": "1",
        "hasNextPage": false,
        "hasPreviousPage": false,
        "data": [
            {
                "id": 1,
                "userId": 1,
                "title": "Complete project documentation",
                "description": "Write comprehensive documentation for the project",
                "status": "pending",
                "startDate": "2025-05-26T23:59:59.000Z",
                "endDate": null,
                "dueDate": "2025-05-28T23:59:59.000Z",
                "createdAt": "2025-05-26T16:24:05.822Z",
                "updatedAt": "2025-05-26T16:24:05.822Z"
            }
        ]
    }
    }
  ```

#### Get Task by ID

- `GET /tasks/:id` (Auth required)

#### Mark Task as Completed

- `POST /tasks/complete/:id` (Auth required)
- Marks the specified task as completed for the authenticated user.
- Response:
  ```json
  {
    "success": true,
    "message": "Task marked as completed successfully"
  }
  ```

#### Update Task

- `PATCH /tasks/:id` (Auth required)
- Body: (any updatable fields)

#### Delete Task

- `DELETE /tasks/:id` (Auth required)

### Reports

#### Time Tracking Report

- `GET /tasks/report-time?page=1&limit=10` (Auth required)
- Supports pagination with `page` and `limit` query parameters as above.
- Example paginated response:
  ```json
  {
    "success": true,
    "message": "Time tracking report generated successfully",
    "data": {
        "totalPages": null,
        "page": "1",
        "hasNextPage": false,
        "hasPreviousPage": false,
        "data": [
            {
                "id": 1,
                "userId": 1,
                "title": "Updated task title",
                "description": "Updated task description",
                "status": "in-progress",
                "startDate": "2025-12-31T23:59:59.000Z",
                "endDate": "2025-12-31T23:59:59.000Z",
                "dueDate": "2025-12-31T23:59:59.000Z",
                "createdAt": "2025-05-26T11:57:20.097Z",
                "updatedAt": "2025-05-26T12:13:10.289Z",
                "timeSpent": 0
            }
        ]
    }
    }
  ```

#### Completion Report

- `GET /tasks/reports` (Auth required)
  - Response
    ```json
        {
      "success": true,
      "message": "Completion report generated successfully",
      "data": {
      "totalTasks": 1,
      "completedTasks": 0,
      "inProgressTasks": 0,
      "pendingTasks": 1,
      "completionRate": 0
        }
      }
      ```

## Example Usage

Register a user:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","password":"password123"}'
```

Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}'
```

Create a task:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"Task description","startDate":"2025-05-26T23:59:59Z","dueDate":"2025-05-28T23:59:59Z"}' \  
```
