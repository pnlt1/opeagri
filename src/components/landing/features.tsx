"use client";

import { Users, Map, Package, Truck, Calendar } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="py-32 bg-primary-50/50 dark:bg-gray-800/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-4">
            La Solution OpeAgri
          </h2>
          <h3 className="text-4xl md:text-5xl font-heading font-medium text-gray-900 dark:text-white">
            Un écosystème complet pour structurer votre coopérative.
          </h3>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <ScrollReveal delay={0} className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Users className="text-primary-600 dark:text-primary-400 w-6 h-6" />
            </div>
            <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">Producteurs</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Enregistrement complet de vos membres. Historique centralisé et base de données sécurisée.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Map className="text-primary-600 dark:text-primary-400 w-6 h-6" />
            </div>
            <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">Parcelles</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Géolocalisation hors ligne depuis l'application mobile. Calcul automatique des surfaces réelles.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-earth-50 dark:bg-earth-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Package className="text-earth-600 dark:text-earth-400 w-6 h-6" />
            </div>
            <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">Intrants</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Suivi des semences et engrais distribués. Calcul exact des montants à rembourser à la récolte pour éviter les litiges.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ScrollReveal delay={0.1} className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start gap-6 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex-shrink-0 flex items-center justify-center">
              <Truck className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">Collecte</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Saisie des pesées sur le terrain. Estimation des rendements et planification optimisée de la logistique des camions.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start gap-6 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex-shrink-0 flex items-center justify-center">
              <Calendar className="text-amber-600 dark:text-amber-400 w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">Campagnes</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Pilotez chaque saison agricole (hivernage, saison sèche) avec des tableaux de bord et des prévisions de volumes claires.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
