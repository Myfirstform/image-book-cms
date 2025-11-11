-- Create faculties table
CREATE TABLE IF NOT EXISTS public.faculties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" 
ON public.faculties
FOR SELECT
TO public
USING (true);

-- Create policies for admin access
CREATE POLICY "Enable all operations for admin users"
ON public.faculties
FOR ALL
TO authenticated
USING (auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_faculties_updated_at
BEFORE UPDATE ON public.faculties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a storage bucket for faculty images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('faculty-images', 'faculty-images', true)
ON CONFLICT (name) DO NOTHING;

-- Set up storage policies for faculty images
CREATE POLICY "Allow public read access for faculty images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'faculty-images');

CREATE POLICY "Allow authenticated uploads for faculty images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'faculty-images' AND 
  (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'))
);

CREATE POLICY "Allow admin updates for faculty images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'faculty-images' AND 
       (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')))
WITH CHECK (bucket_id = 'faculty-images' AND 
            (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')));

CREATE POLICY "Allow admin deletes for faculty images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'faculty-images' AND 
       (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')));
