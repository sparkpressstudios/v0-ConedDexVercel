-- Shop verification requests table
CREATE TABLE IF NOT EXISTS shop_verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  business_license_url TEXT,
  proof_of_ownership_url TEXT,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_shop_id ON shop_verification_requests(shop_id);
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON shop_verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_status ON shop_verification_requests(status);

-- Add verification history table for audit trail
CREATE TABLE IF NOT EXISTS shop_verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES shop_verification_requests(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE shop_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_verification_history ENABLE ROW LEVEL SECURITY;

-- Shop owners can view their own verification requests
CREATE POLICY shop_owner_select_policy ON shop_verification_requests
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM shops WHERE id = shop_id
    )
  );

-- Shop owners can insert verification requests for their shops
CREATE POLICY shop_owner_insert_policy ON shop_verification_requests
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM shops WHERE id = shop_id
    )
  );

-- Shop owners can update their pending verification requests
CREATE POLICY shop_owner_update_policy ON shop_verification_requests
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM shops WHERE id = shop_id
    ) AND status = 'pending'
  );

-- Admins can view all verification requests
CREATE POLICY admin_select_policy ON shop_verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any verification request
CREATE POLICY admin_update_policy ON shop_verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verification history policies
CREATE POLICY history_select_policy ON shop_verification_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shop_verification_requests svr
      JOIN shops s ON svr.shop_id = s.id
      WHERE svr.id = verification_id AND (
        s.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Only admins can insert verification history
CREATE POLICY admin_history_insert_policy ON shop_verification_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
