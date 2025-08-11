-- Enhanced RLS policies with additional security measures

-- Create function to check if user owns the resource
CREATE OR REPLACE FUNCTION auth.user_owns_resource(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies for clients
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.user_owns_resource(user_id));
CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.user_owns_resource(user_id));
CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.user_owns_resource(user_id));
CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.user_owns_resource(user_id));

-- Enhanced RLS policies for tasks
DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.user_owns_resource(user_id));
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.user_owns_resource(user_id));
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.user_owns_resource(user_id));
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.user_owns_resource(user_id));

-- Enhanced RLS policies for invoices
DROP POLICY IF EXISTS "Users can manage own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.user_owns_resource(user_id));
CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.user_owns_resource(user_id));
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.user_owns_resource(user_id));
CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.user_owns_resource(user_id));

-- Enhanced RLS policies for payments
DROP POLICY IF EXISTS "Users can manage own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.user_owns_resource(user_id));
CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.user_owns_resource(user_id));
CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (auth.user_owns_resource(user_id));
CREATE POLICY "Users can delete own payments" ON payments
  FOR DELETE USING (auth.user_owns_resource(user_id));

-- Add audit logging table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.user_owns_resource(user_id));

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, table_name, operation, old_data)
    VALUES (OLD.user_id, TG_TABLE_NAME, TG_OP, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, table_name, operation, old_data, new_data)
    VALUES (NEW.user_id, TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, table_name, operation, new_data)
    VALUES (NEW.user_id, TG_TABLE_NAME, TG_OP, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to main tables
DROP TRIGGER IF EXISTS audit_clients_trigger ON clients;
CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_tasks_trigger ON tasks;
CREATE TRIGGER audit_tasks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_invoices_trigger ON invoices;
CREATE TRIGGER audit_invoices_trigger
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_payments_trigger ON payments;
CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Add data validation constraints
ALTER TABLE clients 
ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT valid_name_length CHECK (length(name) >= 1 AND length(name) <= 255);

ALTER TABLE tasks
ADD CONSTRAINT valid_title_length CHECK (length(title) >= 1 AND length(title) <= 255),
ADD CONSTRAINT valid_status CHECK (status IN ('todo', 'in-progress', 'completed', 'pending')),
ADD CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high'));

ALTER TABLE invoices
ADD CONSTRAINT valid_total CHECK (total >= 0),
ADD CONSTRAINT valid_status CHECK (status IN ('draft', 'sent', 'paid', 'pending', 'partially-paid', 'overdue')),
ADD CONSTRAINT valid_invoice_number_length CHECK (length(invoice_number) >= 1 AND length(invoice_number) <= 50);

ALTER TABLE payments
ADD CONSTRAINT valid_amount CHECK (amount >= 0),
ADD CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed')),
ADD CONSTRAINT valid_payment_method CHECK (payment_method IN ('upi', 'bank_transfer', 'cash', 'card', 'other'));
