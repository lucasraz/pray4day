import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
Promise.all([
  s.from('prayer_chains').select('id').limit(1),
  s.from('original_prayers').select('id').limit(1)
]).then(([chains, prayers]) => {
  console.log('Chains:', chains.data ? 'OK' : 'FAIL', chains.error?.message || '');
  console.log('Prayers:', prayers.data ? 'OK' : 'FAIL', prayers.error?.message || '');
});
