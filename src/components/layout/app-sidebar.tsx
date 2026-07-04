"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Map,
  Package,
  ShoppingCart,
  CalendarDays,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  X,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/toaster";

const mainNavItems = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, adminOnly: true },
  { name: "Producteurs", href: "/producteurs", icon: Users, adminOnly: false },
  { name: "Parcelles", href: "/parcelles", icon: Map, adminOnly: false },
  { name: "Intrants", href: "/intrants", icon: Package, adminOnly: true },
  { name: "Collecte", href: "/collecte", icon: ShoppingCart, adminOnly: false },
  { name: "Campagnes", href: "/campagnes", icon: CalendarDays, adminOnly: true },
  { name: "Rapports", href: "/rapports", icon: BarChart3, adminOnly: true },
];

const otherNavItems = [
  { name: "Paramètres", href: "/parametres", icon: Settings, adminOnly: true },
  { name: "Aide", href: "/aide", icon: HelpCircle, adminOnly: false },
];

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function AppSidebar({
  isOpen,
  setIsOpen,
  role,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  role: "admin" | "agent";
}) {
  const currentPath = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [showConfig, setShowConfig] = useState(true);
  const [stepsCompleted, setStepsCompleted] = useState(6);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const [
          campaignsRes,
          producersRes,
          parcelsRes,
          inventoryRes,
          inputsRes,
          harvestsRes
        ] = await Promise.all([
          supabase.from('campaigns').select('id', { count: 'exact', head: true }),
          supabase.from('producers').select('id', { count: 'exact', head: true }),
          supabase.from('parcels').select('id', { count: 'exact', head: true }),
          supabase.from('inventory').select('id', { count: 'exact', head: true }),
          supabase.from('inputs').select('id', { count: 'exact', head: true }),
          supabase.from('harvests').select('id', { count: 'exact', head: true }),
        ]);

        let completed = 1; // 1 step (account created) is always completed since user is authenticated
        if (campaignsRes.count && campaignsRes.count > 0) completed++;
        if (producersRes.count && producersRes.count > 0) completed++;
        if (parcelsRes.count && parcelsRes.count > 0) completed++;
        if (inventoryRes.count && inventoryRes.count > 0) completed++;
        if (inputsRes.count && inputsRes.count > 0) completed++;
        if (harvestsRes.count && harvestsRes.count > 0) completed++;

        setStepsCompleted(Math.min(completed, 7));
      } catch (err) {
        console.error("Setup progress check failed:", err);
      }
    };

    checkSetup();
  }, [supabase]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    toast("Vous avez été déconnecté avec succès.");
    router.push("/connexion");
  };

  // Filtrer les menus en fonction du rôle
  const visibleMainNavItems = mainNavItems.filter(item => role === "admin" || !item.adminOnly);
  const visibleOtherNavItems = otherNavItems.filter(item => role === "admin" || !item.adminOnly);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-50 dark:border-gray-800 justify-between lg:justify-start">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="OpeAgri Logo"
              width={140}
              height={45}
              className="object-contain"
              priority
            />
          </Link>
          <button className="lg:hidden text-gray-500 dark:text-gray-400 dark:text-gray-500" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="mb-2 px-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Menu Principal</p>
          </div>
          <nav className="space-y-1 mb-8">
            {visibleMainNavItems.map((item) => {
              const isActive = currentPath === item.href || (item.href === "/dashboard" && currentPath === "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 hover:text-gray-900 dark:text-white"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-white" : "text-gray-400 dark:text-gray-500")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mb-2 px-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Autre</p>
          </div>
          <nav className="space-y-1">
            {visibleOtherNavItems.map((item) => {
              const isActive = currentPath === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 hover:text-gray-900 dark:text-white"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-white" : "text-gray-400 dark:text-gray-500")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Setup Progress Widget */}
        {showConfig && role === "admin" && (
          <div className="p-4 mx-4 mb-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 relative group">
            <button
              onClick={() => setShowConfig(false)}
              className="absolute top-2 right-2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Masquer"
            >
              <X size={14} />
            </button>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Configuration</h4>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-4">
                {stepsCompleted}/7 étapes
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${(stepsCompleted / 7) * 100}%` }}
              ></div>
            </div>
            {stepsCompleted === 7 ? (
              <div className="text-xs text-leaf-dark dark:text-leaf-light font-medium bg-leaf-light/10 p-2 rounded-lg text-center mb-3">
                🎉 Configuration complète !
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
                Complétez votre premier cycle de récolte.
              </p>
            )}
            <button
              onClick={() => setShowConfig(false)}
              className="w-full py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {stepsCompleted === 7 ? "Fermer" : "Terminer"}
            </button>
          </div>
        )}

        {/* Profil utilisateur */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
          <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">Vue actuelle :</span>
            <span className="text-xs font-bold text-primary-700 bg-primary-100 px-2 py-1 rounded">
              {role === "admin" ? "Admin" : "Agent"}
            </span>
          </div>

          <div className="flex items-center justify-between hover:bg-gray-50 dark:bg-gray-800 transition-colors rounded-lg p-2 -mx-2">
            <Link
              href="/parametres?tab=profil"
              className="flex items-center gap-3 flex-1"
            >
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                {role === "admin" ? "AD" : "AG"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{role === "admin" ? "Admin OpeAgri" : "Agent Terrain"}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{role === "admin" ? "admin@opeagri.com" : "agent@opeagri.com"}</span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}