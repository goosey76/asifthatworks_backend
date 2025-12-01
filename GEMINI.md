# Project: "AsifThatWorks" - AI Agent Platform

## Project Overview
"AsifThatWorks" is an AI Agent Platform designed to assist busy professionals and individuals in managing their digital lives through a suite of specialized AI agents. The platform aims to offer a personalized and engaging experience by providing agents with distinct personas and specialized expertise. It integrates seamlessly with popular tools like Google Calendar, Google Tasks, and WhatsApp, and features a "Forever Brain" for long-term memory and personalized interactions.

The backend is built with a modular, service-oriented architecture using Node.js, Express, and Supabase. Key services include a `gateway-service` for authentication and routing, a `messenger-service` for unified communication across platforms, a `jarvi-service` for intent analysis and agent orchestration, an `agent-service` for managing specialist agents, a `memory-service` for short-term and long-term memory, and a `user-service` for user management.

## Building and Running

To set up and run the backend:

1.  **Install Dependencies:**
    Navigate to the `backend` directory and run:
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the `backend` directory based on `backend/.env.example` and fill in your Supabase URL, Supabase Anon Key, Gemini API Key, and Google OAuth Client ID/Secret.

3.  **Run the Server:**
    Navigate to the `backend` directory and run:
    ```bash
    node server.js
    ```
    The server will typically run on `http://localhost:3000`.

## Development Conventions
**TODO:** Define coding styles, testing practices, and contribution guidelines. This may include setting up linters (e.g., ESLint), choosing testing frameworks (e.g., Jest), and establishing commit message conventions.

## Security

Row Level Security (RLS) is enabled for all tables in the Supabase database. The RLS policies are documented in `backend/docs/rls_policies.md`.

## Agent Personas
Detailed descriptions of JARVI, GRIM, and MURPHY, including their roles, personas, core directives, and output rules, can be found in `backend/docs/agent_personas.md`.

## Google Tasks API Integration & Enhanced Murphy Task Operations

### Overview
MURPHY integrates with Google Tasks API v1 to provide comprehensive task and tasklist management capabilities. This integration enables MURPHY to create, read, update, and delete both individual tasks AND task lists directly through Google's Task management system.

### API Reference
- **Google Tasks API Documentation**: https://developers.google.com/workspace/tasks/reference/rest
- **Google Tasks API v1 Reference**: https://developers.google.com/workspace/tasks/api/v1/rest

### Enhanced Core Features

#### 1. Individual Task Operations (`backend/src/services/agents/murphy-agent/tasks/task-manager.js`)
MURPHY's task operations are implemented through a modular architecture:

- **Single Task Creation**: Create individual tasks with validation and error handling
- **Multiple Task Creation**: Batch processing for creating several tasks at once
- **Task Completion**: Mark tasks as complete with intelligent task matching
- **Task Retrieval**: List and filter tasks with WhatsApp-friendly formatting
- **Task Updates**: Modify existing tasks (title, due date, description)
- **Task Deletion**: Remove tasks with smart matching algorithms

#### 2. Task List CRUD Operations (`backend/src/services/agents/murphy-agent/tasks/tasklist-operations.js`)
**NEW**: Comprehensive task list management capabilities:

- **Task List Creation**: Create new task lists with validation
- **Task List Retrieval**: List all task lists with WhatsApp formatting
- **Task List Updates**: Rename existing task lists
- **Task List Deletion**: Remove task lists (except default)
- **Task List Details**: Get statistics and information about specific lists
- **Smart Task List Matching**: Find task lists by title with fuzzy matching

#### 3. Task List Management (`backend/src/services/agents/murphy-agent/tasks/google-tasks-client.js`)
Enhanced Google Tasks Client with tasklist operations:

- **tasklists.list**: Get all task lists
- **tasklists.insert**: Create new task list
- **tasklists.patch**: Update task list
- **tasklists.delete**: Delete task list
- **tasklists.get**: Get specific task list details

#### 4. Enhanced Google Tasks Client Features
- **OAuth2 token management** for task list operations
- **Automatic token refresh** 
- **Supabase credential storage** for both tasks and task lists
- **Task list statistics**: Completion rates, task counts, analytics
- **Smart task list matching**: Find lists by name with fuzzy logic

#### 5. Batch Operations (`backend/src/services/agents/murphy-agent/tasks/task-manager.js`)
**ENHANCED**: Comprehensive batch processing:

- **Mixed Operations**: Combine task and tasklist operations in single batch
- **Task List Batch**: Create/update/delete multiple task lists
- **Task Batch**: Process multiple tasks across different lists
- **Error Handling**: Detailed error reporting for failed operations
- **Summary Reports**: WhatsApp-friendly operation summaries

#### 6. Smart Task Organization (`backend/src/services/agents/murphy-agent/tasks/task-manager.js`)
**NEW**: Intelligent task and tasklist management:

- **Auto-categorization**: Work, personal, health, home, learning
- **Task List Suggestions**: Recommend creating task lists for categories
- **Priority Analysis**: Identify high-priority tasks
- **Due Date Clustering**: Group tasks by due dates
- **Organization Recommendations**: Smart productivity suggestions

### Task Management Flow

1. **User Input**: User sends task-related message via WhatsApp
2. **Intent Analysis**: JARVI identifies intent (task create, complete, list, tasklist create, etc.)
3. **MURPHY Processing**: 
   - LLM extraction of task/list details
   - Validation and error handling
   - Task/list intelligence processing
4. **Google Tasks API**: Direct integration with Google Tasks API v1 (both tasks and tasklists)
5. **Response Formatting**: WhatsApp-optimized response with contextual messaging

### API Endpoints Used

#### Task List Operations
- `tasklists.list` - Retrieve all task lists
- `tasklists.insert` - Create new task list
- `tasklists.patch` - Update task list
- `tasklists.delete` - Remove task list
- `tasklists.get` - Get task list details

#### Task Operations
- `tasks.list` - Retrieve tasks from specific lists
- `tasks.insert` - Create tasks in specific lists
- `tasks.patch` - Update existing tasks
- `tasks.delete` - Remove tasks

#### Authentication
- OAuth2 with Google Tasks scope: `https://www.googleapis.com/auth/tasks`
- Token management through Supabase `integrations` table
- Automatic refresh handling

### Task & Task List Intelligence Algorithm

```javascript
// Task categorization example
const categories = {
  work: ['meeting', 'deadline', 'project', 'report'],
  health: ['exercise', 'doctor', 'meditation', 'workout'],
  personal: ['birthday', 'anniversary', 'vacation'],
  home: ['cleaning', 'repair', 'grocery'],
  learning: ['course', 'study', 'read', 'learn']
};

// Smart tasklist organization suggestions
const suggestTaskListCreation = (categorizedTasks) => {
  return Object.entries(categorizedTasks)
    .filter(([category, tasks]) => tasks.length >= 3)
    .map(([category]) => `Consider creating a "${category}" task list`);
};
```

### Error Handling

#### User-Friendly Messages
MURPHY provides contextually appropriate error messages:
- **Invalid tasklist names**: "Hey, I couldn't create that task list. Invalid name provided."
- **Google Tasks not connected**: "Murphy here: Hey, I couldn't access task lists. Google Tasks isn't connected properly."
- **Protected task lists**: "Murphy here: Hey, I can't delete the default task list."
- **Not found errors**: "Murphy here: I couldn't find that task list to update."

#### Validation System
- **Task List Name Validation**: Length (max 100), invalid character checking
- **Protected Operations**: Cannot delete default task list
- **Existence Validation**: Verify task lists exist before operations
- **Permission Checks**: Ensure user owns the task lists

### Response Templates

#### Task List Operations
```javascript
const tasklistResponseTemplates = [
  "Murphy here:\nPerfect!\nI created a new task list:\n{title}\nTime to get organized, Chief!",
  "Murphy here:\nDone!\nAdded your new task list:\n{title}\nStay focused on your goals!",
  "Murphy here:\nGot it!\nCreated task list:\n{title}\nYou're building great habits!"
];
```

#### Batch Operations
```javascript
const batchResponseTemplates = [
  "Murphy here:\n\n🎯 *Batch Operation Summary*\n\n✅ **Successful:** {successCount}\n❌ **Failed:** {failedCount}\n📊 **Total:** {totalCount}\n\n💪 *Great work getting things organized!*"
];
```

### Testing & Validation

#### Comprehensive Test Coverage
- **Task Operations**: Individual and multiple task operations
- **Task List Operations**: CRUD operations on task lists
- **Batch Operations**: Mixed operations testing
- **Smart Organization**: Categorization and suggestions
- **Error Handling**: Validation and user-friendly errors
- **Integration Testing**: Google Tasks API integration

#### Test Files
- `backend/test_enhanced_murphy_operations.js` - Comprehensive testing suite
- `backend/test_murphy_operations_simple.js` - Basic structure testing
- `backend/test_murphy_constructor_fix.js` - Constructor validation

### Integration Points

#### Knowledge Coordination
MURPHY participates in the rotating knowledge system:
- Cross-agent insight sharing
- User pattern tracking for task organization
- Productivity trend analysis across task lists
- Personalized task and tasklist recommendations

#### WhatsApp Integration
- **Task List Display**: Formatted list with numbers and default indicators
- **Statistics Display**: Completion rates and task counts
- **Progress Tracking**: Visual indicators for task completion
- **Smart Suggestions**: Contextual recommendations for organization

#### Cross-Agent Communication
- **Task List Insights**: Share organization patterns with other agents
- **Productivity Analytics**: Provide task completion trends
- **User Behavior**: Track and learn from task management patterns
- **Collaborative Recommendations**: Suggest improvements across agents

## Project Progress Log
This section provides a chronological overview of key project milestones, decisions, and significant changes. Detailed logs for each entry can be found by following the links.

*   **2025-11-02 - Initial Project Setup and Core Services**: [Detailed Log](backend/docs/progress_logs/2025-11-02_initial_setup_and_core_services.md)
*   **2025-11-03 - Authentication, LLM Integration, and Agent Population**: [Detailed Log](backend/docs/progress_logs/2025-11-03_auth_llm_agents.md)
*   **2025-11-03 - Data Restructuring and Agent Persona Refinement**: [Detailed Log](backend/docs/progress_logs/2025-11-03_data_restructuring_and_personas.md)
*   **2025-11-06 - Jarvi Enhancement Plan: Personal Manager & Life Coach**: [Detailed Plan](backend/docs/jarvi_enhancement_plan.md)
*   **2025-11-12 - Calendar System Comprehensive Enhancements**: [Detailed Log](backend/docs/progress_logs/2025-11-12_calendar_enhancements_comprehensive.md)
*   **2025-11-13 - MURPHY Task Manager Enhancement**: [Detailed Log](backend/docs/progress_logs/2025-11-13_murphy_task_manager_enhancement.md)
*   **2025-11-16 - Backend Finalization & Murphy Specialization**: [Detailed Log](backend/docs/progress_logs/2025-11-16_backend_finalization_and_murphy_specialization.md)
*   **2025-11-16 - Murphy Task Operations Verification & Google Tasks API Documentation**: [Detailed Log](backend/docs/progress_logs/2025-11-16_murphy_task_operations_verification.md)
