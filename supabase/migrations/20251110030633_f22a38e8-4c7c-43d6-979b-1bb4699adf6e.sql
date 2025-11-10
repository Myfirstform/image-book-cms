-- Create faculties table
CREATE TABLE IF NOT EXISTS public.faculties (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  designation text NOT NULL,
  image_url text NOT NULL,
  uploaded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view faculties" 
ON public.faculties 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert faculties" 
ON public.faculties 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update faculties" 
ON public.faculties 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete faculties" 
ON public.faculties 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic updated_at timestamp
CREATE TRIGGER update_faculties_updated_at
BEFORE UPDATE ON public.faculties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();