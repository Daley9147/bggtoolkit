-- Force expire all existing integrations to ensure they refresh on next use
UPDATE ghl_integrations
SET expires_at = NOW() - INTERVAL '1 hour';
