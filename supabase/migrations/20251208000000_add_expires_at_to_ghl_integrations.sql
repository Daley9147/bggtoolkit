ALTER TABLE ghl_integrations
ADD COLUMN expires_at TIMESTAMPTZ;

-- Update existing rows with a default far future expiration or current time if applicable
-- For simplicity, let's set it to 1 year from now for existing entries if they don't have a value.
-- In a real scenario, you might want to force a re-auth or carefully consider the default.
UPDATE ghl_integrations
SET expires_at = NOW() + INTERVAL '1 year'
WHERE expires_at IS NULL;

ALTER TABLE ghl_integrations
ALTER COLUMN expires_at SET NOT NULL;