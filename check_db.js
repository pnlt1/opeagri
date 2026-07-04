require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log("Checking tables...");
  
  const tables = ['inventory', 'inputs', 'harvests', 'collections', 'distributions'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table} error: ${error.message}`);
    } else {
      console.log(`Table ${table} exists! Columns:`, data.length > 0 ? Object.keys(data[0]) : "Empty table");
    }
  }
}

checkDb();
