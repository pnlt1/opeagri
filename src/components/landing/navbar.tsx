"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed w-full top-0 z-50 px-4 sm:px-6 lg:px-8 transition-all duration-300 pointer-events-none ${
        scrolled ? "pt-4" : "pt-6"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto flex justify-between items-center pointer-events-auto transition-all duration-300 ${
          scrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm rounded-full px-6 py-2" : ""
        }`}
      >
        {/* Left: Logo */}
        <div className="flex items-center cursor-pointer transition-all">
          <Link href="/">
            <Image src="/logo.png" alt="OpeAgri Logo" width={100} height={32} className="h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* Center: Navigation Pill */}
        <nav className="hidden md:flex bg-gray-900/95 dark:bg-white/5 backdrop-blur-md text-white dark:text-gray-100 rounded-full p-1.5 items-center shadow-lg border border-gray-800 dark:border-gray-700">
          <Link href="#probleme" className="px-5 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-white/10 text-sm font-medium transition-colors">
            Le Problème
          </Link>
          <Link href="#fonctionnalites" className="px-5 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-white/10 text-sm font-medium transition-colors">
            Fonctionnalités
          </Link>
          <Link href="#comment-ca-marche" className="px-5 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-white/10 text-sm font-medium transition-colors">
            Comment ça marche
          </Link>
          <Link href="#tarifs" className="px-5 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-white/10 text-sm font-medium transition-colors">
            Tarifs
          </Link>
        </nav>

        {/* Right: CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <MagneticButton className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors">
            <Link href="/connexion">Se connecter</Link>
          </MagneticButton>
          <MagneticButton className="bg-primary-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-700 shadow-sm transition-colors">
            <Link href="/inscription">Créer un compte</Link>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
