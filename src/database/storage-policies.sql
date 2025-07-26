-- Storage policies for aibot bucket
-- Run this in your Supabase SQL Editor after running the main schema

-- Create the aibot bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'aibot', 
  'aibot', 
  false, 
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/msword']
)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files
-- This policy allows users to upload files to their own user folder
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'aibot' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow users to view their own files
-- Users can only access files in their own user folder
CREATE POLICY "Allow users to view own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'aibot' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow users to update their own files
CREATE POLICY "Allow users to update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'aibot' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow users to delete their own files
CREATE POLICY "Allow users to delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'aibot' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Alternative policy for more granular control based on document records
-- This allows users to access files only if they have a document record
CREATE POLICY "Allow users to access files from own documents" ON storage.objects
FOR ALL USING (
  bucket_id = 'aibot' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.file_path = name 
    AND documents.user_id = auth.uid()
  )
); 