# Supabase Database Schema

This document outlines the SQL schema for the Supabase database used by the "AsifThatWorks" AI Agent Platform backend.

## Table Creation SQL

Below are the SQL commands to create the necessary tables. You can execute these in the Supabase SQL Editor.

```sql
-- Table: users
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text,
    phone_number text, -- Added for linking WhatsApp
    subscription_plan text DEFAULT 'Free' NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Table: agents
CREATE TABLE public.agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    persona text,
    capabilities text[],
    created_at timestamp with time zone DEFAULT now()
);

-- Table: user_agents
CREATE TABLE public.user_agents (
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
    activated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id, agent_id)
);

-- Table: conversations
CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
    messages jsonb, -- Stores an array of message objects
    created_at timestamp with time zone DEFAULT now()
);

-- Table: forever_brain
CREATE TABLE public.forever_brain (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE, -- Optional: Link to a specific conversation
    summary text,
    context jsonb, -- Stores additional context or metadata
    created_at timestamp with time zone DEFAULT now()
);

-- Table: integrations
CREATE TABLE public.integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    provider text NOT NULL, -- e.g., 'google_calendar', 'google_tasks'
    credentials jsonb, -- Stores encrypted credentials or tokens
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, provider)
);

-- Instructions for automatically populating public.users table and adding phone_number column

-- Step 1: Add the 'phone_number' column to your 'public.users' table if you haven't already.
-- You can run this SQL in the Supabase SQL Editor:
-- ALTER TABLE public.users
-- ADD COLUMN phone_number text;

-- Step 2: Create a function and trigger to automatically populate 'public.users'
-- This SQL will create a function that inserts a new row into 'public.users'
-- whenever a new user registers via Supabase authentication ('auth.users').
-- It also creates a trigger that calls this function.
-- Execute the following SQL in your Supabase SQL Editor:

-- Function to create a public.users entry for new auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user() on new auth.users creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  

-- Table: user_goals (New for Jarvi Enhancement Plan)
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

-- Table: user_preferences (New for Jarvi Enhancement Plan)
CREATE TABLE public.user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    preference_key text UNIQUE NOT NULL,
    preference_value jsonb, -- e.g., { "notification_time": "09:00", "focus_areas": ["career", "health"] }
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Extend Table: forever_brain (Modification for Jarvi Enhancement Plan)
ALTER TABLE public.forever_brain
ADD COLUMN type text;
```
