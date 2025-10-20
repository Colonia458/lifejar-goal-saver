-- LifeJar Database Schema (Comprehensive)
-- Merged from schema.sql and schema_update.sql
-- Run this SQL in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create jars table
CREATE TABLE jars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount INTEGER NOT NULL CHECK (target_amount > 0),
  current_amount INTEGER DEFAULT 0 CHECK (current_amount >= 0),
  currency TEXT DEFAULT 'KSH' CHECK (currency IN ('KSH', 'KES', 'USD', 'EUR', 'GBP')),
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  deadline TIMESTAMP WITH TIME ZONE,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contributions table (with updates)
CREATE TABLE contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  jar_id UUID REFERENCES jars(id) ON DELETE CASCADE,
  contributor_name TEXT, -- Made nullable for anonymous contributions
  contributor_email TEXT,
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'KSH',
  payment_status TEXT DEFAULT 'pending',
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table (for tracking payment transactions)
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  jar_id UUID REFERENCES jars(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  contributor_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to increment jar amount
CREATE OR REPLACE FUNCTION increment_jar_amount(jar_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE jars
  SET current_amount = current_amount + amount,
      updated_at = NOW()
  WHERE id = jar_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update jar updated_at timestamp
CREATE OR REPLACE FUNCTION update_jar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update contribution updated_at timestamp
CREATE OR REPLACE FUNCTION update_contribution_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at for jars
CREATE TRIGGER trigger_update_jar_updated_at
  BEFORE UPDATE ON jars
  FOR EACH ROW
  EXECUTE FUNCTION update_jar_updated_at();

-- Create trigger to automatically update updated_at for contributions
CREATE TRIGGER trigger_update_contribution_updated_at
  BEFORE UPDATE ON contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_contribution_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_jars_user_id ON jars(user_id);
CREATE INDEX idx_jars_created_at ON jars(created_at);
CREATE INDEX idx_contributions_jar_id ON contributions(jar_id);
CREATE INDEX idx_contributions_created_at ON contributions(created_at);
CREATE INDEX idx_payments_jar_id ON payments(jar_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Enable Row Level Security (RLS)
ALTER TABLE jars ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for jars
CREATE POLICY "Users can view their own jars" ON jars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jars" ON jars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jars" ON jars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jars" ON jars
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for contributions (public read, authenticated insert)
CREATE POLICY "Anyone can view contributions" ON contributions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert contributions" ON contributions
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for payments (public read, authenticated insert)
CREATE POLICY "Anyone can view payments" ON payments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
