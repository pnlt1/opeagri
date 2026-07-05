"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/toaster";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

import {
  Building2,
  UserCircle,
  Bell,
  Shield,
  Smartphone,
  Database,
  Save,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  Moon,
  Users,
  Package,
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  Camera
} from "lucide-react";

function ParametresContent() {
  const [activeTab, setActiveTab] = useState("organisation");
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasTabParam = searchParams.get("tab") !== null;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab("organisation");
    }
  }, [searchParams]);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // ── Organisation ──
  const [orgData, setOrgData] = useState({
    name: "Coopérative Wend-Panga",
    immatriculation: "RC-BF-OUA-2015-B-1234",
    email: "contact@wendpanga.bf",
    phone: "+226 25 30 12 34",
    address: "Secteur 14, Ouagadougou, Burkina Faso",
    currency: "FCFA",
    areaUnit: "ha",
    weightUnit: "kg"
  });

  // ── Equipe ──
  interface TeamMember {
    id: string;
    initials: string;
    name: string;
    email: string;
    role: string;
    color: string;
  }
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({ name: "", email: "", role: "Agent" });

  useEffect(() => {
    const fetchTeam = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("cooperative_name")
          .eq("id", user.id)
          .single();

        if (myProfile?.cooperative_name) {
          const { data: members } = await supabase
            .from("profiles")
            .select("*")
            .eq("cooperative_name", myProfile.cooperative_name);

          if (members) {
            const formatted = members.map((m: any) => {
              const initials = m.full_name
                ? m.full_name.trim().split(" ").map((p: string) => p[0]).join("").substring(0, 2).toUpperCase()
                : m.email
                ? m.email.substring(0, 2).toUpperCase()
                : "AG";
              const color = m.role === "admin"
                ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800"
                : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800";
              return {
                id: m.id,
                initials,
                name: m.full_name || m.email.split("@")[0],
                email: m.email || "",
                role: m.role === "admin" ? "Admin" : "Agent",
                color,
              };
            });
            setTeamMembers(formatted);
          }
        }
      }
    };
    fetchTeam();
  }, []);

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!memberId) {
      setTeamMembers(prev => prev.filter(m => m.name !== memberName));
      toast(`Membre ${memberName} supprimé de l'équipe.`);
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === memberId) {
      toast("Vous ne pouvez pas supprimer votre propre compte Administrateur.", "error");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("Error deleting member:", error);
      toast("Une erreur est survenue lors de la suppression.", "error");
    } else {
      toast(`Membre ${memberName} supprimé avec succès.`);
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  // ── Catalogue ──
  const [products, setProducts] = useState([
    { id: 1, name: "Coton", type: "Culture", unit: "kg" },
    { id: 2, name: "Sésame", type: "Culture", unit: "kg" },
    { id: 3, name: "Maïs", type: "Culture", unit: "kg" },
    { id: 4, name: "Riz", type: "Culture", unit: "kg" },
    { id: 5, name: "Engrais NPK", type: "Intrant", unit: "sac (50kg)" },
    { id: 6, name: "Urée", type: "Intrant", unit: "sac (50kg)" }
  ]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({ name: "", type: "Culture", unit: "kg" });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProducts([...products, { ...newProductData, id: Date.now() }]);
    setIsProductModalOpen(false);
    toast(`Produit ${newProductData.name} ajouté au catalogue !`);
    setNewProductData({ name: "", type: "Culture", unit: "kg" });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = newMemberData.name.substring(0, 2).toUpperCase() || "XX";
    const color = newMemberData.role === "Admin" ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800" : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800";
    setTeamMembers([...teamMembers, { id: "", ...newMemberData, initials, color }]);
    setIsTeamModalOpen(false);
    toast(`Membre ${newMemberData.name} ajouté à l'équipe !`);
    setNewMemberData({ name: "", email: "", role: "Agent" });
  };
  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setOrgData({ ...orgData, [e.target.name]: e.target.value });

  // ── Profil ──
  const [profileData, setProfileData] = useState({
    firstName: "Utilisateur",
    lastName: "",
    email: "",
    role: "Administrateur",
    phone: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // L'e-mail de connexion réellement confirmé côté Supabase Auth (distinct du
  // champ éditable du formulaire, pour détecter une demande de changement).
  const [confirmedEmail, setConfirmedEmail] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        let fName = "";
        let lName = "";
        if (profile?.full_name) {
          const parts = profile.full_name.trim().split(" ");
          fName = parts[0] || "";
          lName = parts.slice(1).join(" ") || "";
        } else if (user.email) {
          fName = user.email.split("@")[0] || "Utilisateur";
        }

        setProfileData({
          firstName: fName,
          lastName: lName,
          email: user.email || "",
          role: profile?.role === "admin" ? "Administrateur" : "Agent",
          phone: "",
        });
        setConfirmedEmail(user.email || "");

        if (profile?.cooperative_name) {
          setOrgData(prev => ({
            ...prev,
            name: profile.cooperative_name,
            email: user.email || prev.email,
          }));
        }
      }
    };
    loadProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast("Fichier trop volumineux. Taille max: 2 Mo.");
        return;
      }
      const url = URL.createObjectURL(file);
      setProfileImage(url);
      toast("Photo de profil mise à jour localement !");
    }
  };

  // ── Sécurité ──
  const [pwData, setPwData] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome sur Windows 11", location: "Ouagadougou, BF", time: "Session actuelle" },
    { id: 2, device: "Application Mobile (Android)", location: "Ouahigouya, BF", time: "Il y a 2h" },
  ]);

  const revokeSession = (id: number) => {
    setSessions(sessions.filter(s => s.id !== id));
    toast("Session distante révoquée avec succès.");
  };

  // ── Notifications ──
  const [notifPrefs, setNotifPrefs] = useState({
    stock_faible: true,
    nouvelle_collecte: true,
    paiement_en_attente: true,
    synchronisation: false,
    rapport_hebdo: true,
    newsletter: false,
  });
  const toggleNotif = (key: keyof typeof notifPrefs) =>
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Sync Mobile ──
  const [syncData, setSyncData] = useState({
    autoSync: true,
    wifiOnly: false,
    syncInterval: "30",
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast("Synchronisation terminée. 3 agents, 12 producteurs mis à jour.");
    }, 2500);
  };

  // ── Sauvegardes ──
  const [backupHistory, setBackupHistory] = useState([
    { id: 1, date: "01/07/2026 à 02:00", type: "Automatique", size: "4.2 MB", status: "Succès" },
    { id: 2, date: "30/06/2026 à 02:00", type: "Automatique", size: "4.1 MB", status: "Succès" },
    { id: 3, date: "29/06/2026 à 14:32", type: "Manuelle", size: "4.0 MB", status: "Succès" },
    { id: 4, date: "28/06/2026 à 02:00", type: "Automatique", size: "3.9 MB", status: "Succès" },
  ]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleManualBackup = () => {
    setIsBackingUp(true);
    toast("Sauvegarde manuelle en cours...");
    setTimeout(() => {
      const now = new Date();
      const newBackup = {
        id: Date.now(),
        date: `${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}`,
        type: "Manuelle",
        size: "4.3 MB",
        status: "Succès"
      };
      setBackupHistory([newBackup, ...backupHistory]);
      setIsBackingUp(false);
      toast("Sauvegarde manuelle terminée avec succès.");
    }, 2000);
  };

  const handleDownloadBackup = (backup: any) => {
    const blob = new Blob(["Simulation des données SQL OpeAgri"], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_opeagri_${backup.date.replace(/[\/ :]/g, "")}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Sauvegarde du ${backup.date} téléchargée.`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Si l'utilisateur a modifié son e-mail dans le formulaire, on déclenche
      // un vrai changement d'e-mail de connexion Supabase Auth — Supabase
      // enverra un lien de confirmation, le changement ne prend effet
      // qu'après confirmation (traité par /auth/callback).
      const emailChanged = profileData.email.trim() !== "" && profileData.email.trim() !== confirmedEmail;
      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser(
          { email: profileData.email.trim() },
          { emailRedirectTo: `${window.location.origin}/auth/callback?next=/parametres?tab=profil` }
        );
        if (emailError) {
          console.error("Error updating email:", emailError);
          toast(`Impossible de changer l'e-mail : ${emailError.message}`, "error");
          return;
        }
        toast("Un e-mail de confirmation a été envoyé à votre nouvelle adresse. Le changement prend effet une fois le lien confirmé.");
      }

      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          // Tant que le nouvel e-mail n'est pas confirmé, on garde l'e-mail
          // confirmé actuel dans le profil pour ne pas afficher une valeur
          // qui ne correspond pas encore à un vrai identifiant de connexion.
          email: confirmedEmail,
          role: profileData.role === "Administrateur" ? "admin" : "agent",
          cooperative_name: orgData.name,
        });

      if (error) {
        console.error("Error saving profile:", error);
        toast("Une erreur est survenue lors de l'enregistrement.", "error");
      } else {
        if (!emailChanged) {
          toast("Les modifications ont été enregistrées avec succès !");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    } else {
      toast("Les modifications ont été enregistrées avec succès !");
    }
  };

  // ── Toggle Switch Component ──
  function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
    return (
      <button
        type="button"
        onClick={onChange}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none",
          enabled ? "bg-primary" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 shadow transition-transform duration-200",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "organisation":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations de l'organisation</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Mettez à jour les détails de votre coopérative ou entreprise.</p>
              </div>
              <form onSubmit={handleSave}>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'organisation</label>
                      <input type="text" name="name" value={orgData.name} onChange={handleOrgChange}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Numéro d'immatriculation</label>
                      <input type="text" name="immatriculation" value={orgData.immatriculation} onChange={handleOrgChange}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail de contact</label>
                      <input type="email" name="email" value={orgData.email} onChange={handleOrgChange}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                      <input type="text" name="phone" value={orgData.phone} onChange={handleOrgChange}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Adresse complète</label>
                      <input type="text" name="address" value={orgData.address} onChange={handleOrgChange}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
                    <Save size={16} /> Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Préférences Régionales</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Configurez la monnaie et les unités de mesure par défaut.</p>
              </div>
              <form onSubmit={handleSave}>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Devise</label>
                      <select name="currency" value={orgData.currency} onChange={handleOrgChange}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <option value="FCFA">Franc CFA (XOF)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar US ($)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unité de surface</label>
                      <select name="areaUnit" value={orgData.areaUnit} onChange={handleOrgChange}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <option value="ha">Hectare (ha)</option>
                        <option value="acre">Acre</option>
                        <option value="m2">Mètre carré (m²)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unité de poids</label>
                      <select name="weightUnit" value={orgData.weightUnit} onChange={handleOrgChange}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <option value="t">Tonne (t)</option>
                        <option value="kg">Kilogramme (kg)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
                    <Save size={16} /> Enregistrer les préférences
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case "profil":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mon Profil Utilisateur</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Modifiez vos informations personnelles et votre avatar.</p>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-6">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative w-24 h-24 group">
                    <label className="cursor-pointer block w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-md relative overflow-hidden group border-2 border-white dark:border-gray-800">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                          {profileData.firstName[0]}{profileData.lastName[0]}
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 dark:bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera size={20} className="mb-0.5" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Modifier</span>
                      </div>
                      
                      <input type="file" accept="image/png, image/jpeg, image/gif" className="hidden" onChange={handleImageUpload} />
                    </label>
                    
                    {/* Badge Edit Indicator */}
                    <div className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-full shadow-sm pointer-events-none text-gray-500 dark:text-gray-400 group-hover:scale-0 transition-transform duration-200">
                      <Camera size={14} />
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">Photo de profil</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cliquez sur l'image pour la modifier.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Format JPG, PNG ou GIF (Max. 2 Mo).</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
                    <input type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom de famille</label>
                    <input type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail professionnel</label>
                    <input type="email" name="email" value={profileData.email} onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                    <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                    <input type="text" value={profileData.role} readOnly
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
                  <Save size={16} /> Enregistrer le profil
                </button>
              </div>
            </form>
          </div>
        );

      case "securite":
        return (
          <div className="space-y-6">
            {/* Changement de mot de passe */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Changer le mot de passe</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Utilisez un mot de passe fort d'au moins 12 caractères.</p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); toast("Mot de passe mis à jour avec succès !"); setPwData({ current: "", newPw: "", confirm: "" }); }}>
                <div className="p-6 space-y-4">
                  {(["current", "newPw", "confirm"] as const).map((field) => {
                    const labels: Record<typeof field, string> = { current: "Mot de passe actuel", newPw: "Nouveau mot de passe", confirm: "Confirmer le nouveau mot de passe" };
                    return (
                      <div key={field} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{labels[field]}</label>
                        <div className="relative">
                          <input
                            type={showPw[field] ? "text" : "password"}
                            value={pwData[field]}
                            onChange={(e) => setPwData({ ...pwData, [field]: e.target.value })}
                            placeholder="••••••••••••"
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pr-12"
                          />
                          <button type="button" onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                            {showPw[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
                    <Shield size={16} /> Mettre à jour le mot de passe
                  </button>
                </div>
              </form>
            </div>

            {/* Sessions actives */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sessions actives</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Ces appareils sont actuellement connectés à votre compte.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {sessions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.device}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.location} · {s.time}</p>
                    </div>
                    {s.id === 1 ? (
                      <span className="text-xs font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1">
                        <Check size={12} /> Active
                      </span>
                    ) : (
                      <button onClick={() => revokeSession(s.id)} className="text-xs text-red-600 hover:underline font-medium">Révoquer</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Préférences de Notifications</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Choisissez les événements pour lesquels vous souhaitez être alerté.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { key: "stock_faible" as const, label: "Alerte stock faible", desc: "Notifié quand un produit passe sous le seuil minimal." },
                { key: "nouvelle_collecte" as const, label: "Nouvelle pesée enregistrée", desc: "Confirmation à chaque saisie de collecte." },
                { key: "paiement_en_attente" as const, label: "Paiement en attente", desc: "Rappel pour les collectes non encore réglées." },
                { key: "synchronisation" as const, label: "Synchronisation mobile", desc: "Rapport après chaque synchronisation terrain." },
                { key: "rapport_hebdo" as const, label: "Rapport hebdomadaire", desc: "Résumé de l'activité envoyé chaque lundi matin." },
                { key: "newsletter" as const, label: "Nouveautés OpeAgri", desc: "Informations sur les nouvelles fonctionnalités." },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <Toggle enabled={notifPrefs[key]} onChange={() => toggleNotif(key)} />
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button onClick={() => toast("Préférences de notifications enregistrées.")}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
                <Save size={16} /> Enregistrer
              </button>
            </div>
          </div>
        );

      case "sync":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Synchronisation Mobile</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Gérez comment l'application terrain se synchronise avec le serveur.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Synchronisation automatique</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Synchroniser les données des agents automatiquement.</p>
                  </div>
                  <Toggle enabled={syncData.autoSync} onChange={() => setSyncData(p => ({ ...p, autoSync: !p.autoSync }))} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Wi-Fi uniquement</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ne pas utiliser les données mobiles pour synchroniser.</p>
                  </div>
                  <Toggle enabled={syncData.wifiOnly} onChange={() => setSyncData(p => ({ ...p, wifiOnly: !p.wifiOnly }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fréquence de synchronisation</label>
                  <select value={syncData.syncInterval} onChange={(e) => setSyncData(p => ({ ...p, syncInterval: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="15">Toutes les 15 minutes</option>
                    <option value="30">Toutes les 30 minutes</option>
                    <option value="60">Toutes les heures</option>
                    <option value="360">Toutes les 6 heures</option>
                  </select>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Dernière synchronisation</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">01/07/2026 à 10:15 — 12 fiches producteurs mises à jour</p>
                  </div>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors disabled:opacity-60 flex-shrink-0"
                  >
                    <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "En cours..." : "Synchroniser maintenant"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "backup":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sauvegardes des données</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Vos données sont sauvegardées automatiquement chaque nuit à 02h00.</p>
              </div>
              <div className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 mb-6">
                  <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Données protégées</p>
                    <p className="text-xs text-green-700 mt-0.5">La dernière sauvegarde date de ce matin. Toutes vos données sont à jour.</p>
                  </div>
                </div>
                <button
                  onClick={handleManualBackup}
                  disabled={isBackingUp}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors mb-6 disabled:opacity-60"
                >
                  <Database size={16} className={isBackingUp ? "animate-pulse" : ""} />
                  {isBackingUp ? "Sauvegarde en cours..." : "Lancer une sauvegarde manuelle"}
                </button>

                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Historique des sauvegardes</h3>
                
                {/* Vue Desktop (Tableau) */}
                <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Taille</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {backupHistory.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium dark:text-white">{b.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{b.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium dark:text-white text-right">{b.size}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                              <Check size={11} /> {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button onClick={() => handleDownloadBackup(b)}
                              className="text-xs text-primary font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                              Télécharger
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vue Mobile (Cartes) */}
                <div className="sm:hidden flex flex-col gap-4">
                  {backupHistory.map((b) => (
                    <div 
                      key={b.id} 
                      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                            <Database size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{b.date}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{b.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                            <Check size={11} /> {b.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Separator Dashed */}
                      <div className="border-b border-dashed border-gray-100 dark:border-gray-700/60 my-1"></div>

                      <div className="flex flex-col gap-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 dark:text-gray-400">Taille:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{b.size}</span>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button 
                            onClick={() => handleDownloadBackup(b)}
                            className="text-xs text-primary font-bold hover:underline"
                          >
                            Télécharger la sauvegarde
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "apparence":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Apparence</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Personnalisez l'affichage de l'application.</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between py-4">
                 <div>
                   <p className="text-sm font-semibold text-gray-900 dark:text-white">Mode Sombre</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Basculer entre le mode clair et le mode sombre.</p>
                 </div>
                 <Toggle enabled={darkMode} onChange={toggleDarkMode} />
              </div>
            </div>
          </div>
        );

      case "equipe":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Équipe & Rôles</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Gérez les accès de vos collaborateurs.</p>
              </div>
              <button onClick={() => setIsTeamModalOpen(true)} className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-700 transition-colors">
                + Ajouter un membre
              </button>
            </div>
            <div className="p-6 space-y-4">
              {teamMembers.map((member, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">{member.initials}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full border ${member.color}`}>{member.role}</span>
                    <button 
                      type="button"
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                      title="Supprimer le membre"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal d'ajout */}
            <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title="Ajouter un membre">
              <form className="space-y-4" onSubmit={handleAddMember}>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
                  <input type="text" value={newMemberData.name} onChange={e => setNewMemberData({...newMemberData, name: e.target.value})} required className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input type="email" value={newMemberData.email} onChange={e => setNewMemberData({...newMemberData, email: e.target.value})} required className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                  <select value={newMemberData.role} onChange={e => setNewMemberData({...newMemberData, role: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    <option value="Agent">Agent Terrain</option>
                    <option value="Coopérative">Coopérative</option>
                    <option value="Admin">Administrateur</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsTeamModalOpen(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Annuler</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Ajouter</button>
                </div>
              </form>
            </Modal>
          </div>
        );

      case "catalogue":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Catalogue de Produits</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Gérez la liste de vos cultures et intrants.</p>
              </div>
              <button onClick={() => setIsProductModalOpen(true)} className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                <Plus size={16} /> Ajouter
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Vue Desktop (Tableau) */}
              <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom du produit</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unité</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium dark:text-white">{p.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full", p.type === "Culture" ? "bg-green-50 text-green-700 border border-green-200" : "bg-orange-50 text-orange-700 border border-orange-200")}>
                            {p.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{p.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                          <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vue Mobile (Cartes) */}
              <div className="sm:hidden flex flex-col gap-4">
                {products.map((p) => (
                  <div 
                    key={p.id} 
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          <Package size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{p.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    
                    {/* Separator Dashed */}
                    <div className="border-b border-dashed border-gray-100 dark:border-gray-700/60 my-1"></div>

                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full", p.type === "Culture" ? "bg-green-50 text-green-700 border border-green-200" : "bg-orange-50 text-orange-700 border border-orange-200")}>
                          {p.type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Unité:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{p.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal d'ajout de produit */}
            <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Nouveau produit">
              <form className="space-y-4" onSubmit={handleAddProduct}>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom du produit</label>
                  <input type="text" value={newProductData.name} onChange={e => setNewProductData({...newProductData, name: e.target.value})} required className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: Sésame Blanc" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type de produit</label>
                  <select value={newProductData.type} onChange={e => setNewProductData({...newProductData, type: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    <option value="Culture">Culture (Récolte)</option>
                    <option value="Intrant">Intrant (Engrais, Semence)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unité de mesure standard</label>
                  <input type="text" value={newProductData.unit} onChange={e => setNewProductData({...newProductData, unit: e.target.value})} required className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: kg, Tonne, sac (50kg)" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Annuler</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Ajouter le produit</button>
                </div>
              </form>
            </Modal>
          </div>
        );

      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-center min-h-[400px]">
            <p className="text-gray-500 dark:text-gray-400">Section en cours de construction...</p>
          </div>
        );
    }
  };

  const navItems = [
    { id: "organisation", icon: Building2, label: "Organisation" },
    { id: "catalogue", icon: Package, label: "Catalogue de Produits" },
    { id: "profil", icon: UserCircle, label: "Profil" },
    { id: "equipe", icon: Users, label: "Équipe & Rôles" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "securite", icon: Shield, label: "Sécurité & Accès" },
    { id: "sync", icon: Smartphone, label: "Synchronisation Mobile" },
    { id: "backup", icon: Database, label: "Sauvegardes" },
    { id: "apparence", icon: Moon, label: "Apparence" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-10">
      <div className={cn(hasTabParam ? "hidden lg:block" : "block")}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Gérez la configuration de votre plateforme OpeAgri.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menu latéral */}
        <div className={cn("w-full lg:w-64 flex-shrink-0", hasTabParam ? "hidden lg:block" : "block")}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    router.push(`/parametres?tab=${item.id}`);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                    activeTab === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-50 dark:bg-gray-900/50 hover:text-gray-900 dark:text-white"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu */}
        <div className={cn("flex-1 space-y-6", hasTabParam ? "block" : "hidden lg:block")}>
          {hasTabParam && (
            <button
              onClick={() => router.push("/parametres")}
              className="lg:hidden flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700 mb-6 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm w-fit transition-colors"
            >
              <ArrowLeft size={16} />
              Retour aux paramètres
            </button>
          )}
          {renderContent()}
        </div>
      </div>
    </motion.div>
  );
}

export default function ParametresPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400">Chargement des paramètres...</p>
      </div>
    }>
      <ParametresContent />
    </Suspense>
  );
}