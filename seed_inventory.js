require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function seed() {
  // D'abord vider la table (au cas où des lignes invalides existent)
  await sb.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const items = [
    { product: 'Engrais NPK 15-15-15', type: 'Engrais', quantity: 2450, unit: 'Sacs (50kg)', status: 'En stock', last_restock: '2026-05-12' },
    { product: 'Engrais Urée 46%', type: 'Engrais', quantity: 1820, unit: 'Sacs (50kg)', status: 'En stock', last_restock: '2026-05-15' },
    { product: 'Semences Maïs SR21', type: 'Semences', quantity: 45, unit: 'Sacs (10kg)', status: 'Stock faible', last_restock: '2026-04-02' },
    { product: 'Herbicide Total', type: 'Pesticides', quantity: 500, unit: 'Bidons (1L)', status: 'En stock', last_restock: '2026-05-20' },
  ];

  const { data, error } = await sb.from('inventory').insert(items).select();
  if (error) {
    console.log('ERREUR INSERT:', error.message);
  } else {
    console.log('✅ Stock initial inséré avec succès:', data.length, 'produits');
    data.forEach(d => console.log(`  - ${d.product}: ${d.quantity} ${d.unit} (${d.type})`));
  }
}

seed();
