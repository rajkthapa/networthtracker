-- "Paycheck" and "W-2 Salary" were the same income stream split across two categories.
-- Keep 'w2' (Plaid maps WAGES to it), rename it, move every paycheck transaction over,
-- and drop the 'paycheck' default. Safe to re-run.

UPDATE transactions SET category = 'w2' WHERE category = 'paycheck';

UPDATE profiles SET hidden_category_ids = array_remove(hidden_category_ids, 'paycheck')
WHERE 'paycheck' = ANY(hidden_category_ids);

DELETE FROM default_categories WHERE id = 'paycheck';

INSERT INTO default_categories (id, name, icon, color, type, sort_order) VALUES
  ('w2', 'Salary / Paycheck', '💼', '#4c6ef5', 'income', 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  type = EXCLUDED.type,
  sort_order = EXCLUDED.sort_order;
