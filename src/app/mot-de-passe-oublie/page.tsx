"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reinitialiser-mot-de-passe`,
    });

    setIsLoading(false);

    if (error) {
      console.error("Supabase error (reset password):", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else {
      // Toujours confirmer le même message, que l'e-mail existe ou non,
      // pour ne pas révéler quels comptes existent (énumération d'utilisateurs).
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center mb-8">
          <img src="/logo.png" alt="OpeAgri Logo" className="h-16 object-contain" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Mot de passe oublié
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Saisissez votre e-mail, nous vous envoyons un lien de réinitialisation.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-700">
                Si un compte existe pour <strong>{email}</strong>, un e-mail contenant un lien de réinitialisation vient d'être envoyé.
              </p>
              <Link href="/connexion" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500">
                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-gray-200 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-primary-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Envoyer le lien
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-600">
                <Link href="/connexion" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Retour à la connexion
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
