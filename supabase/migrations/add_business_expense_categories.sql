-- Adds business expense categories to the global default list.
-- Safe to re-run: ON CONFLICT DO UPDATE keeps the base list in sync.

INSERT INTO default_categories (id, name, icon, color, type, sort_order) VALUES
  ('business_office',      'Business - Office/Rent',        '🏢', '#7950f2', 'expense', 36),
  ('business_software',    'Business - Software',           '💻', '#4c6ef5', 'expense', 37),
  ('business_advertising', 'Business - Advertising',        '📣', '#f76707', 'expense', 38),
  ('business_supplies',    'Business - Supplies',           '📎', '#868e96', 'expense', 39),
  ('business_equipment',   'Business - Equipment',          '🖥️', '#495057', 'expense', 40),
  ('business_shipping',    'Business - Shipping',           '📦', '#fd7e14', 'expense', 41),
  ('business_contractors', 'Business - Contractors',        '🧑‍💻', '#20c997', 'expense', 42),
  ('business_payroll',     'Business - Payroll',            '💵', '#40c057', 'expense', 43),
  ('business_professional','Business - Legal & Accounting', '⚖️', '#845ef7', 'expense', 44),
  ('business_insurance',   'Business - Insurance',          '🛡️', '#be4bdb', 'expense', 45),
  ('business_travel',      'Business - Travel',             '✈️', '#22b8cf', 'expense', 46),
  ('business_meals',       'Business - Meals',              '🍽️', '#f06595', 'expense', 47),
  ('business_fees',        'Business - Fees & Licenses',    '🧾', '#adb5bd', 'expense', 48),
  ('business_other',       'Business - Other',              '🏪', '#f59f00', 'expense', 49),
  -- keep the generic "Others" bucket at the end of the picker
  ('other_expense',        'Others',                        '📦', '#adb5bd', 'expense', 99)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  type = EXCLUDED.type,
  sort_order = EXCLUDED.sort_order;
