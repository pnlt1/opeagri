import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem";
import { FeaturesSection } from "@/components/landing/features";
import { StepsSection } from "@/components/landing/steps";
import { PricingSection } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 selection:bg-primary-200 selection:text-primary-900">
      <Navbar />
      
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <StepsSection />
        <PricingSection />

        {/* CTA Final */}
        <section className="py-32 bg-gradient-to-b from-[#d8eaf5] to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium text-gray-900 dark:text-white mb-10 leading-tight">
                Rejoignez les utilisateurs qui gèrent leurs campagnes comme des pros.
              </h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2} className="flex justify-center">
              <MagneticButton className="bg-primary text-white px-10 py-5 rounded-full text-xl font-medium hover:bg-primary-700 shadow-xl shadow-primary/20 transition-all">
                <Link href="/inscription" className="flex items-center gap-2 w-full h-full justify-center">
                  Commencer gratuitement <ArrowRight className="w-5 h-5" />
                </Link>
              </MagneticButton>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
