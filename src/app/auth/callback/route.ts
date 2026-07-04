import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Point d'atterrissage des liens envoyés par Supabase Auth (confirmation
// d'e-mail, réinitialisation de mot de passe, magic link, OAuth) : échange le
// code d'autorisation contre une session, puis redirige vers la destination
// prévue par le lien (ou le dashboard par défaut).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
