"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function StepsSection() {
  return (
    <section id="comment-ca-marche" className="py-32 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-24">
          <h3 className="text-4xl md:text-5xl font-heading font-medium text-gray-900 dark:text-white mb-6">
            Adoption en 3 étapes simples
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Pas besoin d'être un expert en informatique pour digitaliser votre coopérative.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Ligne de connexion (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gray-100 dark:bg-gray-800 z-0" />

          <ScrollReveal delay={0.1} className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-300">
              <span className="text-3xl font-heading font-medium text-gray-900 dark:text-white">1</span>
            </div>
            <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">Inscrivez-vous</h4>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Créez votre compte et paramétrez votre organisation agricole depuis l'interface web en quelques clics.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-300">
              <span className="text-3xl font-heading font-medium text-gray-900 dark:text-white">2</span>
            </div>
            <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">Gérez votre campagne</h4>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Ouvrez une nouvelle campagne, configurez vos intrants et enregistrez vos agents de terrain.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3} className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-300">
              <span className="text-3xl font-heading font-medium text-gray-900 dark:text-white">3</span>
            </div>
            <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">Suivez vos producteurs</h4>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Envoyez vos agents sur le terrain avec l'application mobile. Suivez vos producteurs et synchronisez au retour.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
