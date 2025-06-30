
-- Create plant_watering table
CREATE TABLE IF NOT EXISTS public.plant_watering (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  notes TEXT,
  watering_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plant_measurements table
CREATE TABLE IF NOT EXISTS public.plant_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  height INTEGER,
  width INTEGER,
  notes TEXT,
  measurement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.plant_watering ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_measurements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for plant_watering
CREATE POLICY "Users can view watering records for their plants" ON public.plant_watering
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_watering.plant_id 
    AND plants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert watering records for their plants" ON public.plant_watering
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_watering.plant_id 
    AND plants.user_id = auth.uid()
  )
);

-- Create RLS policies for plant_measurements
CREATE POLICY "Users can view measurement records for their plants" ON public.plant_measurements
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_measurements.plant_id 
    AND plants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert measurement records for their plants" ON public.plant_measurements
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_measurements.plant_id 
    AND plants.user_id = auth.uid()
  )
);

-- Create function to get plant watering history
CREATE OR REPLACE FUNCTION public.get_plant_watering(plant_uuid UUID)
RETURNS TABLE (
  id UUID,
  amount INTEGER,
  notes TEXT,
  watering_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT w.id, w.amount, w.notes, w.watering_date
  FROM public.plant_watering w
  JOIN public.plants p ON p.id = w.plant_id
  WHERE w.plant_id = plant_uuid AND p.user_id = auth.uid()
  ORDER BY w.watering_date DESC;
$$;

-- Create function to get plant measurements history
CREATE OR REPLACE FUNCTION public.get_plant_measurements(plant_uuid UUID)
RETURNS TABLE (
  id UUID,
  height INTEGER,
  width INTEGER,
  notes TEXT,
  measurement_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT m.id, m.height, m.width, m.notes, m.measurement_date
  FROM public.plant_measurements m
  JOIN public.plants p ON p.id = m.plant_id
  WHERE m.plant_id = plant_uuid AND p.user_id = auth.uid()
  ORDER BY m.measurement_date DESC;
$$;

-- Create function to add plant watering record
CREATE OR REPLACE FUNCTION public.add_plant_watering(
  plant_uuid UUID,
  amount_ml INTEGER,
  note_text TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  INSERT INTO public.plant_watering (plant_id, amount, notes)
  SELECT plant_uuid, amount_ml, note_text
  WHERE EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_uuid AND plants.user_id = auth.uid()
  )
  RETURNING id;
$$;

-- Create function to add plant measurement record
CREATE OR REPLACE FUNCTION public.add_plant_measurement(
  plant_uuid UUID,
  height_cm INTEGER DEFAULT NULL,
  width_cm INTEGER DEFAULT NULL,
  note_text TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  INSERT INTO public.plant_measurements (plant_id, height, width, notes)
  SELECT plant_uuid, height_cm, width_cm, note_text
  WHERE EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_uuid AND plants.user_id = auth.uid()
  )
  RETURNING id;
$$;
