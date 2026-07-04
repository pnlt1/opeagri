"use client";

import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] bg-gradient-to-b from-[#d8eaf5] via-[#eaf3f8] to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 pt-32 lg:pt-40 pb-0 overflow-hidden flex flex-col items-center">
      <div className="max-w-5xl mx-auto px-4 text-center relative z-10 w-full mb-16">
        <ScrollReveal delay={0.1}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-medium text-gray-900 dark:text-white tracking-tight leading-[1.05] mb-8 max-w-4xl mx-auto">
            Ne perdez plus la trace de vos intrants. <br />
            <span className="italic text-primary-700 dark:text-primary-400">Gérez sans effort.</span>
          </h1>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
            La solution SaaS web et mobile hors ligne qui connecte vos producteurs, sécurise vos avances et digitalise votre collecte.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3} className="flex flex-col sm:flex-row justify-center gap-4 items-center">
          <MagneticButton className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors flex items-center gap-2">
            <Link href="/connexion">Se connecter</Link>
          </MagneticButton>
          
          <MagneticButton className="bg-primary text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-primary-700 shadow-xl shadow-primary/20 transition-all flex items-center gap-2">
            <Link href="/inscription" className="flex items-center gap-2">
              Créer un compte
              <ArrowRight className="w-5 h-5" />
            </Link>
          </MagneticButton>
        </ScrollReveal>
      </div>

      {/* Dashboard Mockup */}
      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 z-10 flex-grow flex items-end">
        <ScrollReveal delay={0.5} direction="up" className="w-full">
          <div className="w-full bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl border border-white/80 dark:border-gray-700/80 rounded-t-[2rem] shadow-[0_40px_80px_-20px_rgba(31,79,49,0.15)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 border-b-0 pb-16 transform transition-transform hover:-translate-y-2 duration-700">
            {/* Top Mockup Bar */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  OA
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Coopérative Wend-Panga</p>
                </div>
              </div>
              <div className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                Board: <span className="text-primary-600 dark:text-primary-400">Campagne 2026</span>
              </div>
            </div>

            {/* Dashboard Interior */}
            <div className="p-8 flex flex-col md:flex-row gap-8 bg-white/40 dark:bg-gray-900/40 h-80">
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-end border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                      Engrais Distribués (Dette)
                    </p>
                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-light text-earth-600 dark:text-earth-400">
                        12 450 <span className="text-xl">kg</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Rendement Estimé</p>
                  <span className="text-4xl font-light text-primary-700 dark:text-primary-400">
                    350 <span className="text-xl">Tonnes</span>
                  </span>
                </div>
              </div>
              {/* Activity */}
              <div className="flex-[1.5] bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300">
                      K
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl rounded-tl-none text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-bold text-gray-900 dark:text-white text-xs block mb-1">
                        Agent Koffi - Terrain
                      </span>
                      Synchronisation réussie : 15 nouvelles parcelles géolocalisées.
                    </div>
                    <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-900 dark:text-primary-200 p-3 rounded-xl rounded-tr-none text-sm ml-12">
                      Super ! Les montants de remboursement ont été mis à jour automatiquement.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Fake Grass Overlay (Optional, but adds to the theme) */}
      <div className="absolute bottom-[-100px] left-[-5%] right-[-5%] h-[200px] bg-[#4a8c2b] dark:bg-[#1a4a16] rounded-[50%_50%_0_0] z-25 shadow-[inset_0_20px_50px_rgba(0,0,0,0.1)] pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-10%] right-[-10%] h-[300px] bg-[radial-gradient(ellipse_at_bottom,#6dba45_0%,#1f4f31_70%,transparent_80%)] rounded-[50%_50%_0_0] blur-[40px] opacity-30 z-20 pointer-events-none" />
    </section>
  );
}
