ALTER TABLE cashflow_entries
  ADD COLUMN IF NOT EXISTS recurrence_frequency TEXT CHECK (recurrence_frequency IN ('monthly', 'quarterly', 'yearly')),
  ADD COLUMN IF NOT EXISTS next_due_date DATE,
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
  ADD COLUMN IF NOT EXISTS parent_entry_id UUID REFERENCES cashflow_entries(id);

CREATE INDEX IF NOT EXISTS idx_cashflow_recurring_due
  ON cashflow_entries (next_due_date)
  WHERE is_recurring = TRUE AND next_due_date IS NOT NULL;
