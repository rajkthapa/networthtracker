-- Adds a single "Business" expense category to the global default list.
-- Also clears the granular business breakdown that briefly shipped before it.
-- Safe to re-run.

DELETE FROM default_categories WHERE id LIKE 'business\_%' AND id <> 'business_expense';

INSERT INTO default_categories (id, name, icon, color, type, sort_order) VALUES
  ('business_expense', 'Business', '🏪', '#f59f00', 'expense', 36),
  -- keep the generic "Others" bucket at the end of the picker
  ('other_expense',    'Others',   '📦', '#adb5bd', 'expense', 99)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  type = EXCLUDED.type,
  sort_order = EXCLUDED.sort_order;
