-- 009_quote_request_link.sql
-- Link quotes to the quote requests that originated them

-- Add FK from quotes to quote_requests
ALTER TABLE quotes
  ADD COLUMN quote_request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL;

CREATE INDEX idx_quotes_quote_request ON quotes(quote_request_id);

-- Add reverse lookup: which quote was a request converted into
ALTER TABLE quote_requests
  ADD COLUMN quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL;

CREATE INDEX idx_quote_requests_quote ON quote_requests(quote_id);
