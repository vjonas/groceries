-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color CHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for grocery_tags
CREATE TABLE IF NOT EXISTS grocery_tags (
    grocery_id INTEGER REFERENCES groceries(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (grocery_id, tag_id)
);

-- Add some sample tags
INSERT INTO tags (name, color) VALUES
    ('Organic', '#34D399'),
    ('Gluten-Free', '#F87171'),
    ('Vegan', '#60A5FA'),
    ('Local', '#FBBF24'),
    ('Sugar-Free', '#A78BFA')
ON CONFLICT (name) DO NOTHING;

-- Add sample tag associations
INSERT INTO grocery_tags (grocery_id, tag_id)
SELECT g.id, t.id
FROM groceries g
CROSS JOIN tags t
WHERE g.name = 'Organic Bananas' AND t.name = 'Organic'
   OR g.name = 'Quinoa' AND t.name = 'Gluten-Free'
   OR g.name = 'Baby Spinach' AND t.name = 'Organic'
   OR g.name = 'Dark Chocolate' AND t.name = 'Vegan'
ON CONFLICT DO NOTHING;

-- Add RLS policies for tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can read tags
CREATE POLICY "Anyone can read tags" ON tags
    FOR SELECT USING (true);

-- Only authenticated users can create tags
CREATE POLICY "Authenticated users can create tags" ON tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Everyone can read grocery_tags
CREATE POLICY "Anyone can read grocery_tags" ON grocery_tags
    FOR SELECT USING (true);

-- Only authenticated users can create grocery_tags
CREATE POLICY "Authenticated users can create grocery_tags" ON grocery_tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');