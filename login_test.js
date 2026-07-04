try { require('dotenv').config({ path: '.env.local' }); } catch (e) {}
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const testEmail = process.env.SEED_ADMIN_EMAIL;
const testPassword = process.env.SEED_ADMIN_PASSWORD;

if (!testEmail || !testPassword) {
  console.error("Erreur : définissez SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD dans .env.local avant d'exécuter ce script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log(`Logging in with ${testEmail}...`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  if (error) {
    console.error("Login Error:", error.message);
  } else {
    console.log("Login Success! User:", data.user.email);
    console.log("Session Access Token:", data.session.access_token ? "Exists" : "None");
  }
}

testLogin();
