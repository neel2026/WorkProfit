# WorkProfit Database Schema Design

## 1. Users Table (`users`)
**Purpose**: Stores all system users (Admin, Employees, Clients).

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto-increment | Unique user ID. |
| `email` | String | Unique, Not Null | User's email address (used for login). |
| `hashed_password` | String | Not Null | Bcrypt hashed password. |
| `first_name` | String | Not Null | User's first name. |
| `last_name` | String | Not Null | User's last name. |
| `phone_number` | String | Nullable | Contact number. |
| `role` | Enum | Not Null | `ADMIN`, `PROJECT_MANAGER`, `TEAM_LEAD`, `STAFF`, `CLIENT`. |
| `department` | Enum | Nullable | `ACCOUNT`, `SALES`, `MARKETING`, `QA`, `DEVELOPER`, `SUPPORT`, `HR`. |
| `avatar_url` | String | Nullable | URL to profile picture. |
| `is_active` | Boolean | Default: True | Soft delete flag. |
| `last_login` | DateTime | Nullable | Timestamp of last login. |
| `created_at` | DateTime | Default: Now | Account creation time. |

## 2. Projects Table (`projects`)
**Purpose**: Stores project details.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto-increment | Unique project ID. |
| `name` | String | Not Null | Project title. |
| `description` | Text | Nullable | Detailed project description. |
| `client_id` | Integer | FK -> `users.id` | The client who owns this project. |
| `team_lead_id` | Integer | FK -> `users.id` | The Team Lead assigned. |
| `start_date` | Date | Not Null | Project start date. |
| `end_date` | Date | Not Null | Project deadline. |
| `status` | Enum | Default: `PLANNING` | `PLANNING`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`, `CANCELLED`. |
| `created_at` | DateTime | Default: Now | Creation timestamp. |

## 3. Project Members Table (`project_members`)
**Purpose**: Many-to-Many relationship between Projects and Users (Staff).

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `project_id` | Integer | FK -> `projects.id` | Composite PK. |
| `user_id` | Integer | FK -> `users.id` | Composite PK. |
| `joined_at` | DateTime | Default: Now | When the user was added to the project. |

## 4. Tasks Table (`tasks`)
**Purpose**: Individual units of work within a project.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto-increment | Unique task ID. |
| `title` | String | Not Null | Task summary. |
| `description` | Text | Nullable | Detailed instructions. |
| `project_id` | Integer | FK -> `projects.id` | The project this task belongs to. |
| `assigned_to` | Integer | FK -> `users.id` | The user responsible for this task. |
| `status` | Enum | Default: `TODO` | `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`. |
| `priority` | Enum | Default: `MEDIUM` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. |
| `due_date` | DateTime | Nullable | Task deadline. |
| `created_at` | DateTime | Default: Now | Creation timestamp. |
| `updated_at` | DateTime | On Update: Now | Last modification time. |

## 5. Activity Logs Table (`activity_logs`)
**Purpose**: Audit trail for system actions (for the "Activity Feed").

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto-increment | Unique log ID. |
| `user_id` | Integer | FK -> `users.id` | Who performed the action. |
| `action` | String | Not Null | Short description (e.g., "Created Task"). |
| `target_type` | String | Not Null | `PROJECT`, `TASK`, `USER`. |
| `target_id` | Integer | Not Null | ID of the affected entity. |
| `details` | JSON | Nullable | Extra data (e.g., "Changed status from TODO to DONE"). |
| `created_at` | DateTime | Default: Now | Timestamp of action. |

## Relationships Diagram (Textual)

*   **User** (1) ---- (N) **Projects** (as Client)
*   **User** (1) ---- (N) **Projects** (as Team Lead)
*   **User** (M) ---- (N) **Projects** (as Member via `project_members`)
*   **Project** (1) ---- (N) **Tasks**
*   **User** (1) ---- (N) **Tasks** (as Assignee)
*   **User** (1) ---- (N) **ActivityLogs**
