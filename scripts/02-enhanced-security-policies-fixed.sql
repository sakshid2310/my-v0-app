-- Enhanced RLS policies with additional security measures (Fixed for Supabase permissions)

-- Enhanced RLS policies for clients
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Enhanced RLS policies for tasks
DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Enhanced RLS policies for invoices
DROP POLICY IF EXISTS "Users can manage own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Enhanced RLS policies for payments
DROP POLICY IF EXISTS "Users can manage own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payments" ON payments
  FOR DELETE USING (auth.uid() = user_id);

-- Enhanced RLS policies for projects
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Enhanced RLS policies for invoice_items
DROP POLICY IF EXISTS "Users can manage own invoice_items" ON invoice_items;
CREATE POLICY "Users can view own invoice_items" ON invoice_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own invoice_items" ON invoice_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own invoice_items" ON invoice_items
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own invoice_items" ON invoice_items
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
  ));

-- Enhanced RLS policies for time_entries
DROP POLICY IF EXISTS "Users can manage own time_entries" ON time_entries;
CREATE POLICY "Users can view own time_entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own time_entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time_entries" ON time_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own time_entries" ON time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Enhanced RLS policies for notifications
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Add data validation constraints
DO $$ 
BEGIN
  -- Add constraints for clients table
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_email' AND table_name = 'clients') THEN
    ALTER TABLE clients ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_name_length' AND table_name = 'clients') THEN
    ALTER TABLE clients ADD CONSTRAINT valid_name_length CHECK (length(name) >= 1 AND length(name) <= 255);
  END IF;

  -- Add constraints for tasks table
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_title_length' AND table_name = 'tasks') THEN
    ALTER TABLE tasks ADD CONSTRAINT valid_title_length CHECK (length(title) >= 1 AND length(title) <= 255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_task_status' AND table_name = 'tasks') THEN
    ALTER TABLE tasks ADD CONSTRAINT valid_task_status CHECK (status IN ('todo', 'in-progress', 'completed', 'pending'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_priority' AND table_name = 'tasks') THEN
    ALTER TABLE tasks ADD CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high'));
  END IF;

  -- Add constraints for invoices table
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_total' AND table_name = 'invoices') THEN
    ALTER TABLE invoices ADD CONSTRAINT valid_total CHECK (total >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_invoice_status' AND table_name = 'invoices') THEN
    ALTER TABLE invoices ADD CONSTRAINT valid_invoice_status CHECK (status IN ('draft', 'sent', 'paid', 'pending', 'partially-paid', 'overdue'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_invoice_number_length' AND table_name = 'invoices') THEN
    ALTER TABLE invoices ADD CONSTRAINT valid_invoice_number_length CHECK (length(invoice_number) >= 1 AND length(invoice_number) <= 50);
  END IF;

  -- Add constraints for payments table
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_amount' AND table_name = 'payments') THEN
    ALTER TABLE payments ADD CONSTRAINT valid_amount CHECK (amount >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_payment_status' AND table_name = 'payments') THEN
    ALTER TABLE payments ADD CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'valid_payment_method' AND table_name = 'payments') THEN
    ALTER TABLE payments ADD CONSTRAINT valid_payment_method CHECK (payment_method IN ('upi', 'bank_transfer', 'cash', 'card', 'other'));
  END IF;
END $$;
