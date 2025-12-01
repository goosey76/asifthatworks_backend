# Project: "AsifThatWorks" - AI Agent Platform

## Detailed Software Architecture

The backend will be a modular, service-oriented architecture built with Node.js, Express, and Supabase.

### Core Services:

*   **`gateway-service`:** The single entry point for all incoming requests. It will be responsible for authentication, request validation, and routing requests to the appropriate service.
*   **`messenger-service`:** This service will act as a unified hub for all messenger communication. It will have a common interface for receiving and sending messages, and will use a system of "adapters" to connect to different messaging platforms (e.g., `whatsapp-adapter`, `telegram-adapter`). This design will allow us to add new messengers in the future without changing the core application logic.
*   **`jarvi-service`:** The core orchestrator service. It will receive requests from the gateway, analyze the user's intent, and either handle the request directly or delegate it to a specialist agent.
*   **`agent-service`:** A generic service for managing specialist agents. It will provide a common interface for creating, configuring, and interacting with agents.
*   **`memory-service`:** The service responsible for managing the short-term and long-term memory of the agents. It will interact with the Supabase database to store and retrieve conversation history and "Forever Brain" memories.
*   **`user-service`:** The service for managing user accounts, profiles, and subscriptions.

### Data Models (Supabase):

*   **`users`:** Stores user information (id, email, name, subscription plan, etc.).
*   **`agents`:** Stores information about the available agents (id, name, persona, capabilities, etc.).
*   **`user_agents`:** A join table that links users to the agents they have activated.
*   **`conversations`:** Stores conversation history (id, user_id, agent_id, messages, etc.).
*   **`forever_brain`:** Stores long-term memories (id, user_id, conversation_id, summary, etc.).
*   **`integrations`:** Stores user-specific credentials for third-party integrations (e.g., Google Calendar, Google Tasks).

### API Endpoints:

*   **Gateway Service:**
    *   `POST /api/v1/messages`: The main endpoint for sending messages to the platform.
    *   `POST /api/v1/auth/register`: User registration.
    *   `POST /api/v1/auth/login`: User login.
*   **User Service:**
    *   `GET /api/v1/users/me`: Get the current user's profile.
    *   `PUT /api/v1/users/me`: Update the current user's profile.
*   **Agent Service:**
    *   `GET /api/v1/agents`: Get a list of available agents.
    *   `POST /api/v1/users/me/agents`: Activate an agent for the current user.

## Step-by-Step Implementation Plan

This plan outlines the initial steps for building the backend.

### Phase 1: Messenger Integration and Core Services

1.  **Initialize Project:**
    *   Set up a new Node.js project with Express.
    *   Initialize a new Supabase project and set up the database schema.
2.  **Create Core Services:**
    *   Create the basic structure for the `gateway-service`, `jarvi-service`, `agent-service`, `memory-service`, and `user-service`.
3.  **Create the `messenger-service`:**
    *   Create the `messenger-service` with a `whatsapp-adapter`.
    *   Implement the logic for receiving messages from the WhatsApp webhook and sending messages back to the user.
4.  **Integrate `messenger-service` with the Gateway:**
    *   Connect the `messenger-service` to the `gateway-service` so that incoming messages are forwarded to JARVI.
5.  **Implement User Authentication (via Messenger):**
    *   Implement a system for identifying and authenticating users based on their phone number.

### Phase 2: JARVI and Agent Orchestration

1.  **Implement JARVI's Core Logic:**
    *   Implement the intent analysis logic in the `jarvi-service`.
    *   Integrate with a language model (e.g., Gemini) to power the intent analysis.
    *   Implement the routing logic to delegate requests to specialist agents.
2.  **Implement the Agent Service:**
    *   Implement the logic for creating and configuring agents.
    *   Implement the interface for interacting with agents.
3.  **Implement the Core Agents (GRIM, MURPHY):**
    *   Create the initial implementations for the GRIM and MURPHY agents.
    *   Define their personas and capabilities in the `agents` table.

### Phase 3: Conversation Memory

1.  **Implement the Memory Service:**
    *   Implement the logic for storing and retrieving conversation history from the `conversations` table.
    *   Implement the "Forever Brain" logic for creating and storing long-term memories in the `forever_brain` table.
2.  **Integrate Memory with JARVI:**
    *   Update the `jarvi-service` to use the `memory-service` to provide context to the agents.

### Phase 4: Third-Party Integrations

1.  **Implement Google Calendar Integration:**
    *   Implement the OAuth 2.0 flow for connecting to Google Calendar.
    *   Implement the logic for creating, reading, updating, and deleting calendar events in the GRIM agent.
2.  **Implement Google Tasks Integration:**
    *   Implement the OAuth 2.0 flow for connecting to Google Tasks.
    *   Implement the logic for creating, reading, updating, and deleting tasks in the MURPHY agent.