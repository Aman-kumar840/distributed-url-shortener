CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    long_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_short_code ON urls(short_code);

CREATE TABLE url_clicks (
    id SERIAL PRIMARY KEY,
    url_id INTEGER REFERENCES urls(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
