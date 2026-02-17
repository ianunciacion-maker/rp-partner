ALTER TABLE locked_dates ADD COLUMN IF NOT EXISTS guest_name TEXT;

CREATE UNIQUE INDEX idx_locked_dates_pencil_unique
  ON locked_dates(property_id, date)
  WHERE source = 'pencil';
