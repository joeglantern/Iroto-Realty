-- Migration: Create currency exchange rates table
-- Description: Support multi-currency pricing with exchange rates
-- Date: 2025-10-05

BEGIN;

-- Create currency exchange rates table
CREATE TABLE IF NOT EXISTS currency_exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate DECIMAL(10, 6) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(from_currency, to_currency)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_currency_exchange_from_to
    ON currency_exchange_rates(from_currency, to_currency);

-- Seed with initial exchange rates (as of Oct 2025)
-- Base currency: KES (Kenyan Shilling)
INSERT INTO currency_exchange_rates (from_currency, to_currency, rate) VALUES
-- KES to other currencies
('KES', 'USD', 0.0077),   -- 1 KES = 0.0077 USD (approx 130 KES = 1 USD)
('KES', 'EUR', 0.0071),   -- 1 KES = 0.0071 EUR (approx 141 KES = 1 EUR)
('KES', 'GBP', 0.0061),   -- 1 KES = 0.0061 GBP (approx 164 KES = 1 GBP)
('KES', 'KES', 1.0),      -- 1 KES = 1 KES (base)

-- Reverse conversions for convenience
('USD', 'KES', 130.0),    -- 1 USD = 130 KES
('EUR', 'KES', 141.0),    -- 1 EUR = 141 KES
('GBP', 'KES', 164.0),    -- 1 GBP = 164 KES
('USD', 'USD', 1.0),
('EUR', 'EUR', 1.0),
('GBP', 'GBP', 1.0),

-- Cross conversions (USD <-> EUR, USD <-> GBP, etc.)
('USD', 'EUR', 0.92),     -- 1 USD = 0.92 EUR
('USD', 'GBP', 0.79),     -- 1 USD = 0.79 GBP
('EUR', 'USD', 1.09),     -- 1 EUR = 1.09 USD
('EUR', 'GBP', 0.86),     -- 1 EUR = 0.86 GBP
('GBP', 'USD', 1.27),     -- 1 GBP = 1.27 USD
('GBP', 'EUR', 1.16)      -- 1 GBP = 1.16 EUR

ON CONFLICT (from_currency, to_currency) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE currency_exchange_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view exchange rates
CREATE POLICY "Anyone can view exchange rates" ON currency_exchange_rates
    FOR SELECT USING (true);

-- RLS Policy: Only admins can manage exchange rates
CREATE POLICY "Admins can manage exchange rates" ON currency_exchange_rates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_currency_exchange_rates
    BEFORE UPDATE ON currency_exchange_rates
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

COMMENT ON TABLE currency_exchange_rates IS 'Currency exchange rates for multi-currency support';
COMMENT ON COLUMN currency_exchange_rates.rate IS 'Exchange rate: 1 from_currency = rate * to_currency';

COMMIT;
