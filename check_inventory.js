require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

sb.from('inventory').select('id, product, type, quantity, status').then(({ data, error }) => {
  if (error) { console.log('ERR:', error.message); return; }
  console.log("Données inventory:", JSON.stringify(data, null, 2));
});
