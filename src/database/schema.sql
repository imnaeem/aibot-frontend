-- AI Bot Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chats table
CREATE TABLE public.chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  is_favorite BOOLEAN DEFAULT false,
  folder_id UUID,
  model_used TEXT DEFAULT 'llama3-8b-8192',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  token_count INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Folders table (for chat organization)
CREATE TABLE public.folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#1976d2',
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add folder_id foreign key to chats
ALTER TABLE public.chats 
ADD CONSTRAINT chats_folder_id_fkey 
FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE SET NULL;

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Chats policies
CREATE POLICY "Users can view own chats" ON public.chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats" ON public.chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats" ON public.chats
  FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from own chats" ON public.messages
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.chats WHERE id = chat_id));

CREATE POLICY "Users can insert messages to own chats" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.chats WHERE id = chat_id));

CREATE POLICY "Users can update messages in own chats" ON public.messages
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.chats WHERE id = chat_id));

CREATE POLICY "Users can delete messages from own chats" ON public.messages
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.chats WHERE id = chat_id));

-- Folders policies
CREATE POLICY "Users can view own folders" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
CREATE INDEX idx_chats_updated_at ON public.chats(updated_at DESC);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX idx_folders_user_id ON public.folders(user_id);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column(); 