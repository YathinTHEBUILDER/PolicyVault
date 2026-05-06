import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testPersistence() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('--- Persistence Audit ---');

  // 1. Check current user session (optional, using anon key for now)
  // 2. Try to select customers
  console.log('Step 1: Selecting customers...');
  const { data: selectData, error: selectError } = await supabase
    .from('customers')
    .select('*')
    .limit(5);

  if (selectError) {
    console.error('❌ Select failed:', selectError);
  } else {
    console.log(`✅ Select successful. Found ${selectData.length} customers.`);
  }

  // 3. Try to insert a dummy customer
  const dummyId = crypto.randomUUID();
  console.log(`Step 2: Inserting dummy customer [${dummyId}]...`);
  const { data: insertData, error: insertError } = await supabase
    .from('customers')
    .insert({
      id: dummyId,
      full_name: 'Audit Test Customer',
      phone_primary: '0000000000',
      email: 'audit@test.com'
    })
    .select();

  if (insertError) {
    console.error('❌ Insert failed:', insertError);
  } else {
    console.log('✅ Insert successful:', insertData[0].id);
  }

  // 4. Verify visibility
  console.log('Step 3: Verifying visibility...');
  const { data: verifyData } = await supabase
    .from('customers')
    .select('id')
    .eq('id', dummyId)
    .single();

  if (verifyData) {
    console.log('✅ Customer is visible!');
  } else {
    console.error('❌ Customer is NOT visible after insert.');
  }
}

testPersistence();
