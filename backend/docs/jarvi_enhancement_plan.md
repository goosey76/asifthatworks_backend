# Jarvi Enhancement Plan: Personal Manager & Life Coach

This document outlines the plan to evolve Jarvi into a more comprehensive standalone agent, capable of acting as a personal manager and life coach, adapting to the user's current state.

## Phase 1: Enhanced Contextual Understanding & Proactive Engagement

The core of a personal manager/life coach is understanding the user's situation and offering relevant, timely assistance.

### 1. Define "Current State" Data Points:

*   **Calendar & Tasks (Existing):** Leverage `Grim` and `Murphy` for events and tasks.
*   **User Goals/Objectives:** Introduce a new mechanism (e.g., a `goals` table in Supabase or an extension to `forever_brain`) to store user-defined long-term and short-term goals.
*   **User Preferences:** Store preferences for communication style, notification times, areas of focus (e.g., fitness, career, learning).
*   **Mood/Sentiment (New):** Implement basic sentiment analysis on incoming user messages to gauge their emotional state. This could be a simple LLM call or a dedicated sentiment analysis library.
*   **Recent Activity:** Track recent interactions, tasks completed, and upcoming events.

### 2. Proactive Suggestion Engine:

*   **Trigger Mechanisms:** Jarvi should not always wait for a prompt. It could proactively suggest actions based on:
    *   **Upcoming Deadlines:** "Sir, you have a task 'Project X Report' due tomorrow. Would you like to allocate time for it?"
    *   **Goal Progress:** "Sir, I noticed you haven't logged progress on your 'Learn Python' goal this week. Would you like me to find some resources or schedule a study session?"
    *   **Inactivity:** "Sir, it seems you've been quiet. Is there anything I can assist you with today?"
    *   **Sentiment Change:** If a user expresses frustration, Jarvi could offer a break suggestion or a motivational quote.
*   **LLM Prompting:** Modify Jarvi's prompt to include directives for proactive suggestions based on the gathered "current state" context.

### 3. Personalized Advice & Coaching:

*   **Knowledge Base Integration:** Expand `forever_brain` to include general life coaching principles, productivity tips, and motivational content. Jarvi can then retrieve and adapt this information.
*   **Adaptive Persona:** While maintaining its core dry sarcasm, Jarvi's tone could subtly adapt based on user sentiment or the context of the conversation (e.g., more empathetic if the user is stressed).

## Phase 2: Implementation Steps

To achieve the above, the following technical modifications would be required:

### 1. Database Schema Enhancements (`backend/docs/database_schema.md`):

*   **`user_goals` Table:**
    ```sql
    CREATE TABLE public.user_goals (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
        goal_name text NOT NULL,
        description text,
        target_date timestamp with time zone,
        status text DEFAULT 'active' NOT NULL, -- 'active', 'completed', 'on_hold'
        progress_notes jsonb, -- e.g., [{date: '...', note: '...'}]
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
    );
    ```
*   **`user_preferences` Table:**
    ```sql
    CREATE TABLE public.user_preferences (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
        preference_key text UNIQUE NOT NULL,
        preference_value jsonb, -- e.g., { "notification_time": "09:00", "focus_areas": ["career", "health"] }
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
    );
    ```
*   **Extend `forever_brain`:** Add a `type` column (e.g., 'personal_insight', 'coaching_principle') to categorize memories, making retrieval more targeted.

### 2. `memory-service` Updates (`backend/src/services/memory-service/index.js`):

*   **New Functions:**
    *   `saveUserGoal(userId, goalData)`
    *   `getUserGoals(userId, status)`
    *   `updateUserGoalProgress(userId, goalId, progressNote)`
    *   `saveUserPreference(userId, key, value)`
    *   `getUserPreference(userId, key)`
*   **Enhanced Context Retrieval:** Modify `getForeverBrain` to filter by `type` and `getConversationHistory` to potentially summarize longer histories for more concise context.

### 3. `jarvi-service` Refinements (`backend/src/services/jarvi-service/index.js`):

*   **Pre-Prompt Context Assembly:** Before calling the LLM, Jarvi will fetch:
    *   User's calendar events (via `Grim` if exposed, or directly from a calendar integration service).
    *   User's tasks (via `Murphy` if exposed, or directly from a task integration service).
    *   User's goals from `user_goals` table.
    *   User's preferences from `user_preferences` table.
    *   Recent conversation sentiment (if implemented).
*   **Proactive Prompting Logic:** Introduce logic to generate a proactive prompt if no direct user message is received (e.g., on a schedule, or triggered by an event). This would involve a new endpoint or scheduled task.
*   **LLM Prompt Engineering:** Significantly expand Jarvi's core prompt to include instructions for:
    *   Analyzing the combined "current state" context.
    *   Identifying opportunities for proactive suggestions (tasks, goals, well-being).
    *   Generating personalized advice or coaching based on context and `forever_brain` insights.
    *   Adapting tone based on sentiment.
*   **New Delegation Types:** Potentially introduce new delegation types for managing goals or preferences.

### 4. New Service: `proactive-engine-service` (Optional but Recommended):

*   A dedicated service that runs on a schedule or is triggered by external events (e.g., a new calendar event, a task nearing its deadline).
*   This service would query user data, identify proactive opportunities, and then call `jarvi-service` with a specific prompt to generate a proactive message.

### 5. `agent-service` (Potential Expansion):

*   If `Grim` and `Murphy` are to be used for proactive queries (e.g., "What are my upcoming events?"), their capabilities might need to be exposed as functions that `jarvi-service` can call directly, rather than just through delegation JSON.

## Adapting to the Current State

Jarvi will adapt by:
*   **Contextualizing Responses:** Its answers will be informed by the user's goals, preferences, and recent activity.
*   **Proactive Outreach:** It will initiate conversations when relevant events or goal milestones occur.
*   **Personalized Tone:** The LLM will be instructed to adjust its dryly sarcastic persona to be more supportive or direct as needed, based on the user's emotional state or the seriousness of the topic.
