-- ============================================================
-- SMART PRICING INTELLIGENCE — FULL RESET & SEED
-- ============================================================

-- 1. APPLY SCHEMA FIXES (Ensure columns exist)

-- PRODUCTS
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

-- COMPETITORS
CREATE TABLE IF NOT EXISTS competitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECOMMENDATIONS
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

-- AUDIT_LOG
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

-- MODEL_ACCURACY
CREATE TABLE IF NOT EXISTS model_accuracy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT,
    mape NUMERIC,
    hit_rate NUMERIC,
    predictions_count INTEGER
);

-- ALERTS
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

-- SCRAPED_DATA
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraped_data' AND column_name='scraped_at') THEN
        ALTER TABLE scraped_data ADD COLUMN scraped_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- RECENT_EVENTS
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

-- 2. CLEAR EXISTING DATA
DELETE FROM recent_events;
DELETE FROM alert_events;
DELETE FROM alert_rules;
DELETE FROM model_accuracy;
DELETE FROM audit_log;
DELETE FROM recommendations;
DELETE FROM scraped_data;
DELETE FROM competitors;
DELETE FROM products;

-- 3. INSERT SEED DATA (from D:\Techno_Clouds\components\sql data\seed_data.sql)

-- PRODUCTS
INSERT INTO products (id, name, sku, category, your_price, created_at) VALUES
  ('P-1001', 'Wireless Headphones X1',     'SKU-WH-X1',   'Audio',       96.50,  NOW() - INTERVAL '180 days'),
  ('P-1042', 'Smart Speaker Plus',          'SKU-SS-PL',   'Smart Home',  149.00, NOW() - INTERVAL '150 days'),
  ('P-2011', 'USB-C Hub Pro 7-in-1',        'SKU-UC-H7',   'Accessories', 54.00,  NOW() - INTERVAL '120 days'),
  ('P-1089', 'Noise Cancel Pro Earbuds',    'SKU-NC-PRO',  'Audio',       210.00, NOW() - INTERVAL '90 days'),
  ('P-3301', 'BT Mechanical Keyboard Elite','SKU-BT-MKE',  'Peripherals', 78.00,  NOW() - INTERVAL '60 days')
ON CONFLICT (id) DO UPDATE
  SET name=EXCLUDED.name, sku=EXCLUDED.sku, category=EXCLUDED.category, your_price=EXCLUDED.your_price;

-- COMPETITORS
INSERT INTO competitors (id, name, created_at) VALUES
  ('C-001', 'BrandZ',      NOW() - INTERVAL '200 days'),
  ('C-002', 'AlphaCo',     NOW() - INTERVAL '200 days'),
  ('C-003', 'NovaTech',    NOW() - INTERVAL '200 days'),
  ('C-004', 'PrimeSys',    NOW() - INTERVAL '200 days'),
  ('C-005', 'CoreEdge',    NOW() - INTERVAL '200 days'),
  ('C-006', 'StellarGear', NOW() - INTERVAL '150 days'),
  ('C-007', 'ApexSound',   NOW() - INTERVAL '120 days')
ON CONFLICT (id) DO NOTHING;

-- SCRAPED_DATA
INSERT INTO scraped_data (competitor_id, product_id, price, scraped_at) VALUES
  ('C-001','P-1001', 98.70, NOW() - INTERVAL '0 days'),
  ('C-002','P-1001', 95.10, NOW() - INTERVAL '0 days'),
  ('C-003','P-1001', 92.00, NOW() - INTERVAL '0 days'),
  ('C-004','P-1001', 89.50, NOW() - INTERVAL '0 days'),
  ('C-005','P-1001', 86.20, NOW() - INTERVAL '0 days'),
  ('C-001','P-1001', 91.00, NOW() - INTERVAL '7 days'),
  ('C-002','P-1001', 93.50, NOW() - INTERVAL '7 days'),
  ('C-003','P-1001', 90.00, NOW() - INTERVAL '7 days'),
  ('C-001','P-1001', 89.00, NOW() - INTERVAL '14 days'),
  ('C-002','P-1001', 91.00, NOW() - INTERVAL '14 days'),
  ('C-003','P-1001', 88.50, NOW() - INTERVAL '14 days'),
  ('C-001','P-1001', 88.00, NOW() - INTERVAL '30 days'),
  ('C-002','P-1001', 90.00, NOW() - INTERVAL '30 days'),
  ('C-001','P-1042', 144.99, NOW() - INTERVAL '0 days'),
  ('C-002','P-1042', 141.00, NOW() - INTERVAL '0 days'),
  ('C-003','P-1042', 138.50, NOW() - INTERVAL '0 days'),
  ('C-004','P-1042', 145.00, NOW() - INTERVAL '0 days'),
  ('C-006','P-1042', 143.00, NOW() - INTERVAL '0 days'),
  ('C-001','P-1042', 148.00, NOW() - INTERVAL '7 days'),
  ('C-002','P-1042', 147.50, NOW() - INTERVAL '7 days'),
  ('C-003','P-1042', 145.00, NOW() - INTERVAL '7 days'),
  ('C-001','P-1042', 151.00, NOW() - INTERVAL '14 days'),
  ('C-002','P-1042', 150.00, NOW() - INTERVAL '14 days'),
  ('C-003','P-1042', 152.00, NOW() - INTERVAL '14 days'),
  ('C-001','P-1042', 153.00, NOW() - INTERVAL '30 days'),
  ('C-002','P-1042', 152.50, NOW() - INTERVAL '30 days'),
  ('C-002','P-2011', 56.00, NOW() - INTERVAL '0 days'),
  ('C-003','P-2011', 52.50, NOW() - INTERVAL '0 days'),
  ('C-004','P-2011', 55.00, NOW() - INTERVAL '0 days'),
  ('C-005','P-2011', 51.00, NOW() - INTERVAL '0 days'),
  ('C-006','P-2011', 57.00, NOW() - INTERVAL '0 days'),
  ('C-002','P-2011', 55.50, NOW() - INTERVAL '7 days'),
  ('C-003','P-2011', 53.00, NOW() - INTERVAL '7 days'),
  ('C-002','P-2011', 56.00, NOW() - INTERVAL '14 days'),
  ('C-003','P-2011', 54.00, NOW() - INTERVAL '14 days'),
  ('C-002','P-2011', 55.00, NOW() - INTERVAL '30 days'),
  ('C-001','P-1089', 224.00, NOW() - INTERVAL '0 days'),
  ('C-007','P-1089', 218.00, NOW() - INTERVAL '0 days'),
  ('C-003','P-1089', 199.00, NOW() - INTERVAL '0 days'),
  ('C-004','P-1089', 215.00, NOW() - INTERVAL '0 days'),
  ('C-001','P-1089', 219.00, NOW() - INTERVAL '7 days'),
  ('C-007','P-1089', 215.00, NOW() - INTERVAL '7 days'),
  ('C-003','P-1089', 198.00, NOW() - INTERVAL '7 days'),
  ('C-001','P-1089', 215.00, NOW() - INTERVAL '14 days'),
  ('C-007','P-1089', 212.00, NOW() - INTERVAL '14 days'),
  ('C-001','P-1089', 209.00, NOW() - INTERVAL '30 days'),
  ('C-007','P-1089', 207.00, NOW() - INTERVAL '30 days'),
  ('C-002','P-3301', 69.00, NOW() - INTERVAL '0 days'),
  ('C-003','P-3301', 74.00, NOW() - INTERVAL '0 days'),
  ('C-004','P-3301', 76.00, NOW() - INTERVAL '0 days'),
  ('C-005','P-3301', 72.50, NOW() - INTERVAL '0 days'),
  ('C-006','P-3301', 80.00, NOW() - INTERVAL '0 days'),
  ('C-002','P-3301', 76.00, NOW() - INTERVAL '7 days'),
  ('C-003','P-3301', 75.00, NOW() - INTERVAL '7 days'),
  ('C-004','P-3301', 77.50, NOW() - INTERVAL '7 days'),
  ('C-002','P-3301', 78.50, NOW() - INTERVAL '14 days'),
  ('C-003','P-3301', 77.00, NOW() - INTERVAL '14 days'),
  ('C-004','P-3301', 79.00, NOW() - INTERVAL '14 days'),
  ('C-002','P-3301', 80.00, NOW() - INTERVAL '30 days'),
  ('C-003','P-3301', 78.00, NOW() - INTERVAL '30 days');

-- RECOMMENDATIONS
INSERT INTO recommendations
  (id, product_id, current_price, recommended_price, floor_price, ceiling_price,
   confidence, impact, rationale, status, segment, region, created_at)
VALUES
  ('R-001', 'P-1001', 96.50, 99.00,  94.00, 104.00, 92, 1.2,
   'BrandZ raised price by 8% to $98.70 this week — highest in 90 days. Market avg moved to $92.30. Your margin is 3.8% below the 18% target. Demand index stable at 0.94. Recommend raising to $99 to capture margin without losing competitive position.',
   'pending', 'Enterprise', 'North India', NOW() - INTERVAL '1 day'),
  ('R-002', 'P-1042', 149.00, 142.00, 138.00, 152.00, 78, 0.8,
   '3 competitors dropped below $145 in the last 7 days. Win rate for Smart Speaker Plus fell from 66% to 54% this month. Deal velocity down 18%. Recommend lowering to $142 to recover SMB win rate without breaching floor margin.',
   'pending', 'SMB', 'West India', NOW() - INTERVAL '2 days'),
  ('R-003', 'P-2011', 54.00, 54.00,  50.00, 58.00,  88, 0.0,
   'Market pricing stable. Competitor avg $54.30. Your margin at 22% — above target. No significant price movement in 14 days. Seasonality index neutral. Recommend holding current price.',
   'pending', 'Mid-Market', 'South India', NOW() - INTERVAL '3 days'),
  ('R-004', 'P-1089', 210.00, 219.00, 205.00, 225.00, 83, 2.1,
   'Premium segment demand index rose 14% QoQ. Only 1 direct competitor (ApexSound) within $10 range. BrandZ is at $224. Enterprise deals closing faster — avg 12 days vs 18 days last quarter. Recommend raising to $219 to narrow gap with BrandZ while staying below ApexSound.',
   'pending', 'Enterprise', 'Pan India', NOW() - INTERVAL '1 day'),
  ('R-005', 'P-3301', 78.00, 74.00,  70.00, 82.00,  71, 0.4,
   'AlphaCo dropped keyboard price from $76 to $69 last week — 9.2% cut. You lost 4 SMB deals in the last 10 days where price was cited as the reason. Recommend lowering to $74 to stay competitive while preserving a $5 margin buffer above AlphaCo.',
   'pending', 'SMB', 'East India', NOW() - INTERVAL '4 days'),
  ('R-096', 'P-2011', 52.00, 54.00,  50.00, 57.00,  81, 0.9,
   'NovaTech raised USB-C Hub to $53. Opportunity to recover margin. Recommend small raise to $54.',
   'approved', 'Mid-Market', 'South India', NOW() - INTERVAL '15 days'),
  ('R-097', 'P-1042', 149.00, 155.00, 145.00, 160.00, 74, 1.4,
   'Competitor avg was $152. Model suggested raise. Analyst rejected — Q4 sales campaign running, did not want to raise during campaign.',
   'rejected', 'SMB', 'West India', NOW() - INTERVAL '18 days'),
  ('R-098', 'P-1001', 93.00, 96.50,  90.00, 100.00, 89, 1.4,
   'BrandZ raised to $97. Margin gap widening. Demand stable. Recommend raising to $96.50.',
   'approved', 'Enterprise', 'North India', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- AUDIT_LOG
INSERT INTO audit_log
  (id, user_name, product_name, old_price, new_price, change_pct, outcome, rationale, timestamp)
VALUES
  (gen_random_uuid(), 'Shantanu D.', 'Wireless Headphones X1',
   93.00, 96.50, 3.8,
   '+1.4% margin improvement over 30 days. Win rate held at 68%.',
   'Accepted ML recommendation. BrandZ raised first — safe window to follow.',
   NOW() - INTERVAL '20 days'),
  (gen_random_uuid(), 'Priya M.', 'Smart Speaker Plus',
   149.00, 149.00, 0,
   'No margin change. Win rate dropped further to 51% in next 2 weeks.',
   'Rejected — Q4 campaign in progress. Did not want to raise price during promotional period.',
   NOW() - INTERVAL '18 days'),
  (gen_random_uuid(), 'Shantanu D.', 'USB-C Hub Pro 7-in-1',
   52.00, 54.00, 3.8,
   '+0.9% margin. No impact on win rate. Market accepted the change.',
   'Modified recommendation. Raised to $54 instead of suggested $55 — conservative approach.',
   NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), 'Rahul V.', 'Noise Cancel Pro Earbuds',
   205.00, 210.00, 2.4,
   '+1.1% margin. Enterprise pipeline grew 8% in 30 days post-change.',
   'Accepted. Premium segment showed strong demand signal — comfortable raising.',
   NOW() - INTERVAL '35 days'),
  (gen_random_uuid(), 'Priya M.', 'BT Mechanical Keyboard Elite',
   82.00, 78.00, -4.9,
   '+6% win rate recovery in SMB. Revenue neutral due to volume increase.',
   'Accepted — multiple lost deals cited price as blocker. Needed to move fast.',
   NOW() - INTERVAL '45 days'),
  (gen_random_uuid(), 'Rahul V.', 'Wireless Headphones X1',
   91.00, 93.00, 2.2,
   '+0.8% margin. No significant win rate change.',
   'Accepted partial raise. Raised to $93 instead of $95 — market was still adjusting.',
   NOW() - INTERVAL '55 days');

-- MODEL_ACCURACY
INSERT INTO model_accuracy (id, month, mape, hit_rate, predictions_count) VALUES
  (gen_random_uuid(), 'Nov 2025', 5.8, 71, 14),
  (gen_random_uuid(), 'Dec 2025', 5.1, 74, 18),
  (gen_random_uuid(), 'Jan 2026', 4.9, 76, 21),
  (gen_random_uuid(), 'Feb 2026', 4.6, 78, 19),
  (gen_random_uuid(), 'Mar 2026', 4.4, 80, 23),
  (gen_random_uuid(), 'Apr 2026', 4.2, 79, 11);

-- ALERT_RULES
INSERT INTO alert_rules (id, name, condition, channel, active, created_at) VALUES
  ('AR-001', 'Competitor price drop > 5%',
   'scraped_price_change_pct < -5',
   'in-app', true, NOW() - INTERVAL '90 days'),
  ('AR-002', 'Your margin below 18%',
   'product_margin_pct < 18',
   'in-app', true, NOW() - INTERVAL '90 days'),
  ('AR-003', 'Win rate drops below 50%',
   'win_rate_30d < 50',
   'email', true, NOW() - INTERVAL '60 days'),
  ('AR-004', 'Recommendation confidence below 70%',
   'recommendation_confidence < 70',
   'in-app', true, NOW() - INTERVAL '45 days'),
  ('AR-005', 'Data stale — no scrape in 24h',
   'last_scrape_age_hours > 24',
   'in-app', true, NOW() - INTERVAL '30 days'),
  ('AR-006', 'Price index vs market > 115',
   'price_index > 115',
   'email', false, NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- ALERT_EVENTS
INSERT INTO alert_events (id, rule_name, severity, message, timestamp, read) VALUES
  ('AE-001', 'Competitor price drop > 5%',
   'high',
   'AlphaCo dropped BT Mechanical Keyboard Elite from $76.00 to $69.00 — a 9.2% cut. 4 SMB deals lost this week.',
   NOW() - INTERVAL '4 days', false),
  ('AE-002', 'Your margin below 18%',
   'high',
   'Wireless Headphones X1 margin fell to 14.2% — 3.8% below the 18% target. Recommend reviewing pricing.',
   NOW() - INTERVAL '2 days', false),
  ('AE-003', 'Win rate drops below 50%',
   'medium',
   'Smart Speaker Plus win rate in SMB segment is now 48% — below 50% threshold for the first time this quarter.',
   NOW() - INTERVAL '3 days', false),
  ('AE-004', 'Competitor price drop > 5%',
   'medium',
   '3 competitors dropped Smart Speaker Plus below $145. Market avg fell from $151 to $142.30 in 7 days.',
   NOW() - INTERVAL '5 days', true),
  ('AE-005', 'Data stale — no scrape in 24h',
   'low',
   'PrimeSys scraper returned no data for 26 hours on Apr 21. Data may be stale for Headphones X1 and Earbuds.',
   NOW() - INTERVAL '3 days', true),
  ('AE-006', 'Recommendation confidence below 70%',
   'low',
   'BT Keyboard Elite recommendation confidence is 71% — just above threshold. Review signal quality before acting.',
   NOW() - INTERVAL '4 days', true)
ON CONFLICT (id) DO NOTHING;

-- RECENT_EVENTS
INSERT INTO recent_events
  (id, product_id, product_name, competitor, old_price, new_price, change_pct, timestamp)
VALUES
  (gen_random_uuid(), 'P-3301', 'BT Mechanical Keyboard Elite',
   'AlphaCo', 76.00, 69.00, -9.2, NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'P-1001', 'Wireless Headphones X1',
   'BrandZ', 91.00, 98.70, 8.5, NOW() - INTERVAL '6 days'),
  (gen_random_uuid(), 'P-1042', 'Smart Speaker Plus',
   'NovaTech', 145.00, 138.50, -4.5, NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), 'P-1042', 'Smart Speaker Plus',
   'AlphaCo', 147.50, 141.00, -4.4, NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), 'P-1042', 'Smart Speaker Plus',
   'BrandZ', 148.00, 144.99, -2.0, NOW() - INTERVAL '8 days'),
  (gen_random_uuid(), 'P-1089', 'Noise Cancel Pro Earbuds',
   'BrandZ', 219.00, 224.00, 2.3, NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'P-2011', 'USB-C Hub Pro 7-in-1',
   'CoreEdge', 53.00, 51.00, -3.8, NOW() - INTERVAL '9 days'),
  (gen_random_uuid(), 'P-3301', 'BT Mechanical Keyboard Elite',
   'NovaTech', 77.00, 74.00, -3.9, NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), 'P-1001', 'Wireless Headphones X1',
   'CoreEdge', 89.00, 86.20, -3.1, NOW() - INTERVAL '12 days'),
  (gen_random_uuid(), 'P-1089', 'Noise Cancel Pro Earbuds',
   'ApexSound', 212.00, 218.00, 2.8, NOW() - INTERVAL '14 days');
