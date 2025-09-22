-- Create simple travel sections table
CREATE TABLE IF NOT EXISTS travel_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL CHECK (page_type IN ('pre_arrival', 'getting_there')),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Rich text HTML content
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_travel_sections_page_type ON travel_sections(page_type);
CREATE INDEX IF NOT EXISTS idx_travel_sections_sort_order ON travel_sections(sort_order);

-- Enable RLS
ALTER TABLE travel_sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON travel_sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated full access" ON travel_sections
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_travel_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_travel_sections_updated_at
  BEFORE UPDATE ON travel_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_sections_updated_at();