-- TWS Stream to Blog — Pipeline State Store
-- Postgres-compatible schema
-- Run once against your Postgres database before activating the n8n workflows.
--
-- Example:
--   psql -h localhost -U n8n -d n8n -f setup-state-store.sql
--
-- Or from inside a Docker container:
--   docker exec -i <postgres-container> psql -U n8n -d n8n -f /path/to/setup-state-store.sql

CREATE TABLE IF NOT EXISTS pipeline_runs (
    video_id      TEXT PRIMARY KEY,
    channel_id    TEXT NOT NULL,
    detected_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status        TEXT NOT NULL DEFAULT 'pending',
    transcript    TEXT,
    chart_urls    TEXT,
    blog_post_id  TEXT,
    published_url TEXT,
    llm_cost_usd  NUMERIC(10, 6),
    error_message TEXT,
    failed_step   TEXT,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status      ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_detected_at ON pipeline_runs(detected_at);

-- Optional: trigger to keep updated_at current automatically
-- Uncomment if you want the database to manage this instead of n8n queries.
--
-- CREATE OR REPLACE FUNCTION set_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- DROP TRIGGER IF EXISTS trg_pipeline_runs_updated_at ON pipeline_runs;
-- CREATE TRIGGER trg_pipeline_runs_updated_at
--   BEFORE UPDATE ON pipeline_runs
--   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
