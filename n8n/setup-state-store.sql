CREATE TABLE IF NOT EXISTS pipeline_runs (
    video_id      TEXT PRIMARY KEY,
    channel_id    TEXT NOT NULL,
    detected_at   DATETIME NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending',
    transcript    TEXT,
    chart_urls    TEXT,
    blog_post_id  TEXT,
    published_url TEXT,
    llm_cost_usd  REAL,
    error_message TEXT,
    failed_step   TEXT,
    updated_at    DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_detected_at ON pipeline_runs(detected_at);
