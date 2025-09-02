CREATE TABLE financial_insights (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID,
  insight JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
