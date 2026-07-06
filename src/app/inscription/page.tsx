"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

const countryPrefixes: Record<string, string> = {
  CI: "+225",
  SN: "+221",
  ML: "+223",
  BF: "+226",
  CM: "+237",
  TG: "+228",
  BJ: "+229",
  other: "+",
};

export default function InscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Controlled form state
  const [formData, setFormData] = useState({
    orgName: "", orgType: "", country: "", region: "",
    adminName: "", adminRole: "", email: "", phone: "",
    size: "", password: "", confirmPassword: "",
    cgu: false, privacy: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update phone prefix when country changes
  useEffect(() => {
    if (formData.country && countryPrefixes[formData.country]) {
      // Si le numéro ne commence pas déjà par le bon préfixe, on l'ajoute
      const prefix = countryPrefixes[formData.country];
      if (!formData.phone.startsWith(prefix)) {
        setFormData(prev => ({ ...prev, phone: prefix + " " }));
      }
    }
  }, [formData.country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Password Validation
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== "";
  const isFormValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch && formData.cgu && formData.privacy;
  
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault(); // Utilise la validation HTML5 du form courant
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLength || !hasUppercase || !hasNumber || !passwordsMatch) {
      toast("Veuillez vérifier les critères du mot de passe.");
      return;
    }
    if (!formData.cgu || !formData.privacy) {
      toast("Veuillez accepter les conditions d'utilisation.");
      return;
    }
    
    setIsLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          org_name: formData.orgName,
          admin_name: formData.adminName,
        }
      }
    });

    setIsLoading(false);

    if (error) {
      console.error("Supabase signUp error:", error);
      const readableMessage =
        error.message && error.message.trim() && error.message.trim() !== "{}"
          ? error.message
          : "Ce nom d'organisation est peut-être déjà utilisé, ou une erreur est survenue. Veuillez réessayer.";
      toast(`Erreur d'inscription : ${readableMessage}`, "error");
    } else {
      // Create public profile record
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: formData.email,
            role: 'admin',
            full_name: formData.adminName,
            cooperative_name: formData.orgName,
          });
        if (profileError) {
          console.error("Error creating public profile:", profileError);
        }
      }
      toast("Compte créé avec succès ! Redirection vers la page de connexion...");
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/connexion");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex justify-center items-center mb-8">
          <img src="/logo.png" alt="OpeAgri Logo" className="h-16 object-contain" />
        </Link>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Créer un compte OpeAgri
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <Link href="/connexion" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Connectez-vous
            </Link>
          </p>
        </div>

        {/* Wizard Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 rounded-full z-0 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }}></div>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors ${step >= num ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                {num}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-500 mt-2 px-1">
            <span>Organisation</span>
            <span className="text-center">Contact</span>
            <span className="text-right">Sécurité</span>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          
          {/* ETAPE 1: Organisation */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations sur l'organisation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nom de l'organisation</label>
                  <input type="text" name="orgName" value={formData.orgName} onChange={handleChange} required placeholder="Coopérative, entreprise, ONG..." className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type d'organisation</label>
                  <select name="orgType" value={formData.orgType} onChange={handleChange} required className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="">Sélectionnez un type...</option>
                    <option value="cooperative">Coopérative</option>
                    <option value="union">Union de producteurs</option>
                    <option value="exportateur">Exportateur</option>
                    <option value="agro">Agro-industrie</option>
                    <option value="ong">ONG / Projet</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Pays</label>
                  <select name="country" value={formData.country} onChange={handleChange} required className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="">Sélectionnez un pays...</option>
                    <option value="CI">Côte d'Ivoire (CI)</option>
                    <option value="SN">Sénégal (SN)</option>
                    <option value="ML">Mali (ML)</option>
                    <option value="BF">Burkina Faso (BF)</option>
                    <option value="CM">Cameroun (CM)</option>
                    <option value="TG">Togo (TG)</option>
                    <option value="BJ">Bénin (BJ)</option>
                    <option value="other">Autre pays</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Région / Ville <span className="text-gray-400 font-normal">(Optionnel)</span></label>
                  <input type="text" name="region" value={formData.region} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="flex w-full justify-center items-center gap-2 rounded-xl bg-gray-900 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-gray-800 transition-all">
                  Suivant <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {/* ETAPE 2: Administrateur & Taille */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations de contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                  <input type="text" name="adminName" value={formData.adminName} onChange={handleChange} required className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fonction</label>
                  <input type="text" name="adminRole" value={formData.adminRole} onChange={handleChange} required placeholder="Président, Directeur..." className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Adresse e-mail professionnelle</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Numéro de téléphone <span className="text-gray-400 font-normal">(WhatsApp si possible)</span></label>
                  <div className="mt-1 flex rounded-xl shadow-sm">
                    <span className="inline-flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 text-gray-500 sm:text-sm font-medium">
                      {countryPrefixes[formData.country] || "🌐"}
                    </span>
                    <input type="tel" name="phone" value={formData.phone.replace(countryPrefixes[formData.country] + " ", "")} onChange={(e) => {
                        const prefix = countryPrefixes[formData.country] ? countryPrefixes[formData.country] + " " : "";
                        setFormData(prev => ({...prev, phone: prefix + e.target.value}));
                    }} required className="block w-full min-w-0 flex-1 rounded-none rounded-r-xl border border-gray-200 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Taille de l'organisation (Producteurs)</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Moins de 100', '100–500', '500–2 000', 'Plus de 2 000'].map((size) => (
                    <label key={size} className="cursor-pointer">
                      <input type="radio" name="size" value={size} checked={formData.size === size} onChange={handleChange} required className="peer sr-only" />
                      <div className="rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-600 transition-all peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 hover:bg-gray-50">
                        {size}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white py-3 px-4 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button type="submit" className="flex flex-1 justify-center items-center gap-2 rounded-xl bg-gray-900 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-gray-800 transition-all">
                  Suivant <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {/* ETAPE 3: Sécurité */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sécurité du compte</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required className="block w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Password Criteria */}
                  <div className="mt-3 space-y-1">
                    <p className={`text-xs flex items-center gap-1.5 ${formData.password === "" ? 'text-gray-500' : hasMinLength ? 'text-green-600' : 'text-red-500'}`}>
                      {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className={`w-3.5 h-3.5 ${formData.password !== "" ? 'text-red-500' : 'text-gray-400'}`} />} 8 caractères minimum
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 ${formData.password === "" ? 'text-gray-500' : hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                      {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className={`w-3.5 h-3.5 ${formData.password !== "" ? 'text-red-500' : 'text-gray-400'}`} />} Une lettre majuscule
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 ${formData.password === "" ? 'text-gray-500' : hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                      {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className={`w-3.5 h-3.5 ${formData.password !== "" ? 'text-red-500' : 'text-gray-400'}`} />} Un chiffre
                    </p>
                  </div>
                </div>
 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation du mot de passe</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="block w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword !== "" && (
                    <p className={`mt-1 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordsMatch ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
                    </p>
                  )}
                </div>
              </div>
 
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="cgu" checked={formData.cgu} onChange={handleChange} required className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-600">{"J'accepte les "}<a href="#" className="text-primary-600 hover:underline">{"Conditions d'utilisation"}</a>{" d'OpeAgri."}</span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="privacy" checked={formData.privacy} onChange={handleChange} required className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-600">{"J'accepte la "}<a href="#" className="text-primary-600 hover:underline">Politique de confidentialité</a>.</span>
                </label>
              </div>
 
              {!isFormValid && (formData.password !== "" || formData.confirmPassword !== "" || formData.cgu || formData.privacy) && (
                <div className="p-3.5 bg-red-50/70 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 space-y-1">
                  {(!hasMinLength || !hasUppercase || !hasNumber) && formData.password !== "" ? (
                    <p>• Le mot de passe ne respecte pas les critères de sécurité requis.</p>
                  ) : null}
                  {formData.confirmPassword !== "" && !passwordsMatch ? (
                    <p>• Les mots de passe de confirmation ne correspondent pas.</p>
                  ) : null}
                  {!formData.cgu || !formData.privacy ? (
                    <p>{"• Vous devez cocher et accepter les Conditions d'utilisation et la Politique de confidentialité."}</p>
                  ) : null}
                </div>
              )}

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white py-3 px-4 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="flex flex-1 justify-center items-center gap-2 rounded-xl border border-transparent bg-primary-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {"Finaliser l'inscription"}
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
