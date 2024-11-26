import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private migrations = [
    {
      name: '001_initial_setup',
      sql: `
        -- Add user_id column if it doesn't exist
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'user_id'
          ) THEN
            ALTER TABLE orders ADD COLUMN user_id uuid;
          END IF;
        END $$;

        -- Add foreign key constraint to auth.users
        ALTER TABLE IF EXISTS orders
          DROP CONSTRAINT IF EXISTS orders_user_id_fkey,
          ADD CONSTRAINT orders_user_id_fkey 
          FOREIGN KEY (user_id)
          REFERENCES auth.users(id)
          ON DELETE CASCADE;

        -- Add RLS policy for users to see only their orders
        DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
        CREATE POLICY "Users can view their own orders" ON orders
          FOR SELECT TO authenticated
          USING (auth.uid() = user_id);

        -- Add RLS policy for users to create their own orders
        DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
        CREATE POLICY "Users can create their own orders" ON orders
          FOR INSERT TO authenticated
          WITH CHECK (auth.uid() = user_id);

        -- Add RLS policy for users to update their own orders
        DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
        CREATE POLICY "Users can update their own orders" ON orders
          FOR UPDATE TO authenticated
          USING (auth.uid() = user_id);

        -- Insert sample grocery items if table is empty
        INSERT INTO groceries (name, price, category, stock)
        SELECT * FROM (VALUES
          ('Organic Bananas', 2.99, 'Produce', 100),
          ('Whole Milk', 3.49, 'Dairy', 50),
          ('Whole Wheat Bread', 4.29, 'Bakery', 30),
          ('Free Range Eggs', 5.99, 'Dairy', 40),
          ('Ground Coffee', 12.99, 'Beverages', 25),
          ('Chicken Breast', 8.99, 'Meat', 20),
          ('Atlantic Salmon', 15.99, 'Seafood', 15),
          ('Greek Yogurt', 4.99, 'Dairy', 45),
          ('Baby Spinach', 3.99, 'Produce', 35),
          ('Red Bell Peppers', 1.99, 'Produce', 60),
          ('Extra Virgin Olive Oil', 9.99, 'Pantry', 40),
          ('Quinoa', 6.99, 'Grains', 30),
          ('Almonds', 7.99, 'Nuts & Seeds', 25),
          ('Dark Chocolate', 3.99, 'Snacks', 50),
          ('Honey', 8.99, 'Pantry', 20)
        ) AS v(name, price, category, stock)
        WHERE NOT EXISTS (SELECT 1 FROM groceries LIMIT 1);
      `
    },
    {
      name: '002_add_tags',
      sql: `
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
      `
    }
  ];

  constructor(private supabaseService: SupabaseService) {}

  async runMigration() {
    try {
      for (const migration of this.migrations) {
        const { error } = await this.supabaseService.supabase.rpc('run_migration', {
          migration_sql: migration.sql
        });
        
        if (error) throw error;
        console.log(`Migration ${migration.name} completed successfully`);
      }
      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}