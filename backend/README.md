# AsifThatWorks Backend

This directory contains the backend services for the "AsifThatWorks" AI Agent Platform.

## Project Structure

- `package.json`: Defines project metadata and dependencies.
- `node_modules/`: Installed Node.js modules.
- `docs/`: Contains project-specific documentation, including `database_schema.md` and `agent_personas.md`.
- `src/services/`: Contains individual directories for each core service (e.g., `gateway-service`, `messenger-service`, `jarvi-service`, `agent-service`, `memory-service`, `user-service`).

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)

### Installation

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Server

To start the Express server:

```bash
node server.js
```

The server will run on `http://localhost:3000` (or the port specified by the `PORT` environment variable).

## Core Services Overview

As per the software architecture, the backend will be composed of several core services:

-   **`gateway-service`**: Single entry point for all requests, handling authentication, validation, and routing.
-   **`messenger-service`**: Unified hub for messenger communication with adapters for different platforms (e.g., WhatsApp).
-   **`jarvi-service`**: Core orchestrator, analyzing user intent and delegating to specialist agents.
-   **`agent-service`**: Generic service for managing specialist agents.
-   **`memory-service`**: Manages short-term and long-term memory for agents.
-   **`user-service`**: Manages user accounts, profiles, and subscriptions.

These services will be developed as separate modules or microservices within this backend project to maintain a structured and organized codebase.
