-- Insert sample grocery items
INSERT INTO groceries (name, price, category, stock) VALUES
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
ON CONFLICT (id) DO NOTHING;