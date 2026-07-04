"use client";

import { Check } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import Link from "next/link";

export function PricingSection() {
  return (
    <section id="tarifs" className="py-32 bg-gray-50 dark:bg-gray-850 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-20">
          <h3 className="text-4xl md:text-5xl font-heading font-medium text-gray-900 dark:text-white mb-6">
            Des tarifs transparents
          </h3>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {/* Plan Gratuit */}
          <ScrollReveal delay={0.1} className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">Gratuit</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Pour tester la solution</p>
            <div className="mb-8">
              <span className="text-5xl font-light text-gray-900 dark:text-white">0</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium ml-2">FCFA / mois</span>
            </div>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Check className="text-primary-500 w-5 h-5 flex-shrink-0" /> 5 Producteurs maximum
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Check className="text-primary-500 w-5 h-5 flex-shrink-0" /> 1 utilisateur
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Check className="text-primary-500 w-5 h-5 flex-shrink-0" /> App Mobile hors ligne
              </li>
            </ul>
            <Link
              href="/inscription"
              className="block w-full text-center py-4 rounded-full font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Choisir
            </Link>
          </ScrollReveal>

          {/* Plan Pro */}
          <ScrollReveal delay={0.2} className="bg-gray-900 dark:bg-primary-900 p-10 rounded-[2rem] shadow-2xl border border-gray-800 dark:border-primary-800 relative transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
              LE PLUS POPULAIRE
            </div>
            <h4 className="text-2xl font-heading font-bold text-white mb-2">Pro</h4>
            <p className="text-gray-400 dark:text-primary-200 text-sm mb-8">Pour les coopératives actives</p>
            <div className="mb-8">
              <span className="text-5xl font-light text-white">10 000</span>
              <span className="text-gray-400 dark:text-primary-200 font-medium ml-2">FCFA / mois</span>
            </div>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-gray-300 dark:text-primary-100">
                <Check className="text-primary-500 dark:text-primary-300 w-5 h-5 flex-shrink-0" /> Producteurs <strong className="text-white ml-1">Illimités</strong>
              </li>
              <li className="flex items-center gap-3 text-gray-300 dark:text-primary-100">
                <Check className="text-primary-500 dark:text-primary-300 w-5 h-5 flex-shrink-0" /> 1 utilisateur
              </li>
              <li className="flex items-center gap-3 text-gray-300 dark:text-primary-100">
                <Check className="text-primary-500 dark:text-primary-300 w-5 h-5 flex-shrink-0" /> Gestion Intrants & Avances
              </li>
              <li className="flex items-center gap-3 text-gray-300 dark:text-primary-100">
                <Check className="text-primary-500 dark:text-primary-300 w-5 h-5 flex-shrink-0" /> Tableau de bord complet
              </li>
            </ul>
            <MagneticButton className="w-full text-center py-4 rounded-full font-medium text-gray-900 bg-white hover:bg-gray-100 transition-colors">
              <Link href="/inscription" className="w-full h-full flex items-center justify-center">Commencer Pro</Link>
            </MagneticButton>
          </ScrollReveal>

          {/* Plan Business */}
          <ScrollReveal delay={0.3} className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">Business</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Pour les grandes organisations</p>
            <div className="mb-8">
              <span className="text-5xl font-light text-gray-900 dark:text-white">25 000</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium ml-2">FCFA / mois</span>
            </div>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Check className="text-primary-500 w-5 h-5 flex-shrink-0" /> Tout du plan Pro
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Check className="text-primary-500 w-5 h-5 flex-shrink-0" /> Utilisateurs <strong className="text-gray-900 dark:text-white ml-1">Multiples</strong>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Check className="text-primary-500 w-5 h-5 flex-shrink-0" /> Contrôle des accès
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Check className="text-primary-500 w-5 h-5 flex-shrink-0" /> Exportations avancées
              </li>
            </ul>
            <Link
              href="/contact"
              className="block w-full text-center py-4 rounded-full font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Contacter
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
