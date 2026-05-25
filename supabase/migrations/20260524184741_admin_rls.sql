-- Allow Admins to manage all products
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Allow Admins to manage mentoring schedules
CREATE POLICY "Admins can manage mentoring schedules" ON public.mentoring_schedules
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Allow Admins to manage vouchers
CREATE POLICY "Admins can manage vouchers" ON public.voucher_code
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Allow Admins to manage all transactions
CREATE POLICY "Admins can manage transactions" ON public.transactions
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Allow Admins to manage all transaction items
CREATE POLICY "Admins can manage transaction items" ON public.transaction_items
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Allow everyone to read vouchers so they can apply them in cart
CREATE POLICY "Vouchers are viewable by everyone" ON public.voucher_code
  FOR SELECT USING (true);

-- Allow users to insert and update their own transactions
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to insert their own transaction items
CREATE POLICY "Users can insert own transaction items" ON public.transaction_items
  FOR INSERT WITH CHECK (
    transaction_id IN (SELECT id FROM public.transactions WHERE user_id = auth.uid())
  );
