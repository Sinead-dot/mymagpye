
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create treasures table to store bookmarked items
CREATE TABLE public.treasures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(10,2),
  image TEXT,
  url TEXT NOT NULL,
  platform TEXT,
  status TEXT NOT NULL DEFAULT 'hunting' CHECK (status IN ('hunting', 'found', 'claimed')),
  found_price DECIMAL(10,2),
  date_spotted TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_hunted TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confidence INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on treasures
ALTER TABLE public.treasures ENABLE ROW LEVEL SECURITY;

-- Create policies for treasures
CREATE POLICY "Users can view their own treasures" 
  ON public.treasures 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own treasures" 
  ON public.treasures 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own treasures" 
  ON public.treasures 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own treasures" 
  ON public.treasures 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Create trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
