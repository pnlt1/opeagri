require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const testEmail = process.env.TEST_SIGNUP_EMAIL;
const testPassword = process.env.TEST_SIGNUP_PASSWORD;

if (!testEmail || !testPassword) {
  console.error("Erreur : définissez TEST_SIGNUP_EMAIL et TEST_SIGNUP_PASSWORD dans .env.local avant d'exécuter ce script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegister() {
  console.log(`Registering ${testEmail}...`);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });
  if (error) {
    console.error("SignUp Error:", error.message);
  } else {
    console.log("SignUp Success!", data.user ? data.user.id : "No user returned");
  }
}

testRegister();
