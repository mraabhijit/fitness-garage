-- Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_path     TEXT NOT NULL
                        CHECK (folder_path IN (
                            'assets/gallery',
                            'assets/transformations'
                        )),
    file_name       TEXT NOT NULL,
    media_type      TEXT NOT NULL
                        CHECK (media_type IN ('image', 'video')),
    caption         TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    uploaded_by     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (folder_path, file_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_folder ON gallery(folder_path);
CREATE INDEX IF NOT EXISTS idx_gallery_is_active ON gallery(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery(display_order);

-- Trigger
DROP TRIGGER IF EXISTS trg_gallery_updated_at ON gallery;
CREATE TRIGGER trg_gallery_updated_at
    BEFORE UPDATE ON gallery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
