-- Create facilities table
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- Create policies for facilities
CREATE POLICY "Anyone can view facilities" 
ON public.facilities 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert facilities" 
ON public.facilities 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update facilities" 
ON public.facilities 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete facilities" 
ON public.facilities 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_facilities_updated_at
BEFORE UPDATE ON public.facilities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();