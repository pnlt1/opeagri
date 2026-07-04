try { require('dotenv').config({ path: '.env.local' }); } catch (e) {}
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
  const tables = ['profiles', 'producers', 'parcels', 'harvests', 'inputs', 'inventory', 'campaigns'];
  console.log("Checking row counts for OpeAgri tables:");
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`- Table '${table}': ERROR - ${error.message}`);
    } else {
      console.log(`- Table '${table}': ${count} rows`);
    }
  }
}

checkAll();
