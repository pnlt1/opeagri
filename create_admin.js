require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  console.error("Erreur : définissez SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD dans .env.local avant d'exécuter ce script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log("Création du compte administrateur en cours...");

  const { data, error } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
    options: {
      data: {
        org_name: 'Coopérative Alpha',
        admin_name: 'Admin OpeAgri',
      }
    }
  });

  if (error) {
    console.error("Erreur lors de la création :", error.message);
  } else {
    console.log(`✅ Compte ${adminEmail} créé avec succès !`);
    console.log("⚠️ ATTENTION : Un e-mail de confirmation a été envoyé à cette adresse.");
    if (data?.user?.identities?.length === 0) {
      console.log("Le compte existait peut-être déjà.");
    }
  }
}

createAdmin();
