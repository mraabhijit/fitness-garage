-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_review_id    TEXT NOT NULL UNIQUE,
    reviewer_name       TEXT NOT NULL,
    review_text         TEXT,
    rating              INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_date         DATE NOT NULL,
    last_synced_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_visible          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_review_date ON reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_visible ON reviews(is_visible);

-- Trigger
DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews;
CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
