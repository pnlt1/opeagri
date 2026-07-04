"use client";

import { UserX, PackageMinus, TrendingDown, Globe } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function ProblemSection() {
  const problems = [
    {
      icon: UserX,
      title: "Mauvais suivi des producteurs",
      desc: "Des cahiers mal tenus, des doublons, et une impossibilité de localiser précisément les parcelles et leurs surfaces réelles.",
      color: "earth",
    },
    {
      icon: PackageMinus,
      title: "Pertes d'informations sur les intrants",
      desc: "Des semences et engrais distribués à crédit sans traçabilité claire, entraînant des pertes financières massives à la récolte.",
      color: "red",
    },
    {
      icon: TrendingDown,
      title: "Difficultés à prévoir les récoltes",
      desc: "Impossible d'anticiper les volumes à collecter, causant une logistique chaotique et des surcoûts de transport.",
      color: "gray",
    },
    {
      icon: Globe,
      title: "Manque de traçabilité pour l'export",
      desc: "L'incapacité à prouver l'origine exacte des produits vous ferme les portes des marchés internationaux exigeants.",
      color: "blue",
    },
  ];

  return (
    <section id="probleme" className="py-32 bg-white dark:bg-gray-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-earth-600 dark:text-earth-400 tracking-widest uppercase mb-4">
            La Réalité du Terrain
          </h2>
          <h3 className="text-4xl md:text-5xl font-heading font-medium text-gray-900 dark:text-white">
            Gérer une organisation agricole sans outil est un cauchemar logistique.
          </h3>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((prob, idx) => (
            <ScrollReveal
              key={idx}
              delay={idx * 0.1}
              className={`p-10 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 ${
                prob.color === "earth"
                  ? "bg-earth-50/50 dark:bg-earth-900/10 border-earth-100 dark:border-earth-900/30 hover:bg-earth-50 dark:hover:bg-earth-900/20"
                  : prob.color === "red"
                  ? "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : prob.color === "blue"
                  ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750"
              }`}
            >
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <prob.icon
                  className={`w-5 h-5 ${
                    prob.color === "earth"
                      ? "text-earth-600 dark:text-earth-400"
                      : prob.color === "red"
                      ? "text-red-500"
                      : prob.color === "blue"
                      ? "text-blue-500"
                      : "text-gray-500"
                  }`}
                />
              </div>
              <h4 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">
                {prob.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {prob.desc}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
