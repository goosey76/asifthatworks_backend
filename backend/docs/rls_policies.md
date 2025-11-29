# RLS Policies

This file documents the Row Level Security (RLS) policies for the AsifThatWorks project.

## `conversations` table

-- Allow users to insert their own conversations
CREATE POLICY "Allow individual insert for conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own conversations
CREATE POLICY "Allow individual select for conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = user_id);

## `forever_brain` table

-- Allow users to insert their own "forever brain" entries
CREATE POLICY "Allow individual insert for forever_brain"
ON public.forever_brain
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own "forever brain" entries
CREATE POLICY "Allow individual select for forever_brain"
ON public.forever_brain
FOR SELECT
USING (auth.uid() = user_id);
