-- FIX PRODUCTS TABLE
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category') THEN
        ALTER TABLE products ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sku') THEN
        ALTER TABLE products ADD COLUMN sku TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='your_price') THEN
        ALTER TABLE products ADD COLUMN your_price NUMERIC;
    END IF;
END $$;

-- CREATE COMPETITORS TABLE
CREATE TABLE IF NOT EXISTS competitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FIX RECOMMENDATIONS TABLE
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recommendations' AND column_name='ceiling_price') THEN
        ALTER TABLE recommendations ADD COLUMN ceiling_price NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recommendations' AND column_name='floor_price') THEN
        ALTER TABLE recommendations ADD COLUMN floor_price NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recommendations' AND column_name='impact') THEN
        ALTER TABLE recommendations ADD COLUMN impact NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recommendations' AND column_name='rationale') THEN
        ALTER TABLE recommendations ADD COLUMN rationale TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recommendations' AND column_name='current_price') THEN
        ALTER TABLE recommendations ADD COLUMN current_price NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recommendations' AND column_name='recommended_price') THEN
        ALTER TABLE recommendations ADD COLUMN recommended_price NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recommendations' AND column_name='confidence') THEN
        ALTER TABLE recommendations ADD COLUMN confidence NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recommendations' AND column_name='status') THEN
        ALTER TABLE recommendations ADD COLUMN status TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recommendations' AND column_name='segment') THEN
        ALTER TABLE recommendations ADD COLUMN segment TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recommendations' AND column_name='region') THEN
        ALTER TABLE recommendations ADD COLUMN region TEXT;
    END IF;
END $$;

-- CREATE AUDIT_LOG TABLE
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT,
    product_name TEXT,
    old_price NUMERIC,
    new_price NUMERIC,
    change_pct NUMERIC,
    outcome TEXT,
    rationale TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE MODEL_ACCURACY TABLE
CREATE TABLE IF NOT EXISTS model_accuracy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT,
    mape NUMERIC,
    hit_rate NUMERIC,
    predictions_count INTEGER
);

-- CREATE ALERT TABLES
CREATE TABLE IF NOT EXISTS alert_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    condition TEXT,
    channel TEXT DEFAULT 'in-app',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_events (
    id TEXT PRIMARY KEY,
    rule_name TEXT,
    severity TEXT,
    message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT false
);

-- FIX SCRAPED_DATA TABLE
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraped_data' AND column_name='competitor_id') THEN
        ALTER TABLE scraped_data ADD COLUMN competitor_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraped_data' AND column_name='product_id') THEN
        ALTER TABLE scraped_data ADD COLUMN product_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraped_data' AND column_name='price') THEN
        ALTER TABLE scraped_data ADD COLUMN price NUMERIC;
    END IF;
END $$;

-- FIX RECENT_EVENTS TABLE
CREATE TABLE IF NOT EXISTS recent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT,
    product_name TEXT,
    competitor TEXT,
    old_price NUMERIC,
    new_price NUMERIC,
    change_pct NUMERIC,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ADD RECENT_EVENTS COLUMNS IF TABLE EXISTED
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recent_events' AND column_name='new_price') THEN
        ALTER TABLE recent_events ADD COLUMN new_price NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recent_events' AND column_name='old_price') THEN
        ALTER TABLE recent_events ADD COLUMN old_price NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recent_events' AND column_name='change_pct') THEN
        ALTER TABLE recent_events ADD COLUMN change_pct NUMERIC;
    END IF;
END $$;
