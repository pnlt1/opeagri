"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Search, Bell, Menu, Settings, LogOut, User, CheckCheck, Package, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const mockNotifications = [
  {
    id: 1,
    type: "warning",
    title: "Stock faible détecté",
    message: "Semences Maïs SR21 : seulement 45 sacs restants.",
    time: "Il y a 5 min",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Pesée validée",
    message: "COL-2026-004 : 3 100 kg de Coton pour Ilboudo Jean.",
    time: "Il y a 23 min",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Nouvelle parcelle ajoutée",
    message: "PAR-2026-005 cartographiée pour Amadou Traoré.",
    time: "Il y a 1h",
    read: true,
  },
  {
    id: 4,
    type: "info",
    title: "Synchronisation mobile",
    message: "12 producteurs synchronisés depuis l'application terrain.",
    time: "Il y a 3h",
    read: true,
  },
];

const notifColors: Record<string, string> = {
  warning: "bg-orange-100 text-orange-600",
  success: "bg-green-100 text-green-600",
  info: "bg-blue-100 text-blue-600",
};

const notifIcons: Record<string, React.ElementType> = {
  warning: Package,
  success: CheckCheck,
  info: Map,
};

interface TopbarProps {
  onMenuClick: () => void;
  onLogout?: () => void;
}

export function Topbar({ onMenuClick, onLogout }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isMac, setIsMac] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("Chargement...");
  const router = useRouter();
  const supabase = createClient();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    
    // Détection de l'OS (Mac) et indication de montage
    setMounted(true);
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.toUpperCase().indexOf('MAC') >= 0);
    }
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email || "Utilisateur");
    });
    
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Recherche globale ${mounted ? (isMac ? '(⌘K)' : '(Ctrl+K)') : ''}...`}
            className="block w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-semibold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white shadow-sm flex items-center gap-0.5 opacity-0 animate-in fade-in duration-300" style={{ opacity: mounted ? 1 : 0 }}>
              {mounted && isMac ? (
                <>
                  <span className="text-sm leading-none -mt-0.5">⌘</span>
                  <span>K</span>
                </>
              ) : (
                mounted ? "Ctrl K" : ""
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Statut en ligne */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-gray-600">En ligne</span>
        </div>

        {/* Cloche Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          >
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
            <Bell size={20} />
          </button>
          {notifOpen && (
            <div className="absolute right-[-48px] sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] bg-white rounded-2xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={14} /> Tout marquer comme lu
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {notifications.map((notif) => {
                  const Icon = notifIcons[notif.type];
                  return (
                    <div
                      key={notif.id}
                      onClick={() =>
                        setNotifications((prev) =>
                          prev.map((n) => n.id === notif.id ? { ...n, read: true } : n)
                        )
                      }
                      className={cn(
                        "flex gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors",
                        !notif.read && "bg-primary/5"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg h-fit flex-shrink-0", notifColors[notif.type])}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-sm font-semibold text-gray-900", !notif.read && "text-primary")}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                <button className="text-xs text-primary font-medium hover:underline w-full text-center">
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profil */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity"
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-gray-900">OpeAgri Admin</span>
              <span className="text-xs text-gray-500">Administrateur</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-primary/20 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">AD</span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden">
              {/* En-tête du profil */}
              <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">AD</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">OpeAgri Admin</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Administrateur
                  </span>
                </div>
              </div>

              {/* Actions du menu */}
              <div className="py-2">
                <button
                  onClick={() => { setProfileOpen(false); window.location.href = "/parametres?tab=profil"; }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <User size={16} className="text-gray-400" />
                  Mon Profil
                </button>
                <button
                  onClick={() => { setProfileOpen(false); window.location.href = "/parametres"; }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Settings size={16} className="text-gray-400" />
                  Paramètres
                </button>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="py-2">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
