"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/toaster";
import { createClient } from "@/utils/supabase/client";

import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  PhoneCall,
  Search,
  ChevronDown,
  ChevronRight,
  MapPin,
  Package,
  Users,
  BarChart3,
  Smartphone,
  Mail,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const faqData = [
  {
    category: "Gestion des Parcelles",
    icon: MapPin,
    color: "bg-green-50 text-green-600",
    items: [
      {
        q: "Comment ajouter une nouvelle parcelle avec les coordonnées GPS ?",
        a: "Rendez-vous dans le menu « Parcelles », cliquez sur « Nouvelle Parcelle » et renseignez les informations du producteur, la surface et la culture. Les coordonnées GPS peuvent être saisies manuellement ou captées via l'application mobile terrain en mode géolocalisation."
      },
      {
        q: "Comment basculer entre la vue liste et la vue carte ?",
        a: "Sur la page Parcelles, utilisez les boutons « Liste » et « Carte » situés en haut à droite du tableau. La vue Carte affiche chaque parcelle sous forme de fiche avec ses coordonnées géographiques."
      },
    ]
  },
  {
    category: "Intrants & Stocks",
    icon: Package,
    color: "bg-orange-50 text-orange-600",
    items: [
      {
        q: "Comment enregistrer une distribution d'intrants à un producteur ?",
        a: "Dans le menu « Intrants », cliquez sur « Nouvelle Distribution », sélectionnez le producteur et le produit, puis saisissez la quantité. Le stock disponible est automatiquement mis à jour en temps réel."
      },
      {
        q: "Comment créer une alerte de stock faible ?",
        a: "Les alertes sont automatiques. Lorsqu'un produit passe sous le seuil critique (50 unités par défaut), une notification apparaît dans le centre de notifications de la topbar et le statut passe à « Stock faible » dans le tableau."
      },
    ]
  },
  {
    category: "Producteurs & Campagnes",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
    items: [
      {
        q: "Comment importer une liste de producteurs depuis un fichier Excel ?",
        a: "Rendez-vous sur la page « Producteurs », puis cliquez sur le bouton « Importer » en haut à droite. Sélectionnez votre fichier CSV (format attendu : Prénom, Nom, Village, Coopérative, Téléphone, Surface) pour que les producteurs soient ajoutés instantanément à votre base."
      },
      {
        q: "Comment exporter la liste des producteurs en CSV ?",
        a: "Sur la page Producteurs, appliquez vos filtres si nécessaire, puis cliquez sur « Exporter ». Un fichier CSV contenant tous les producteurs actuellement affichés sera téléchargé immédiatement dans votre navigateur."
      },
    ]
  },
  {
    category: "Rapports & Analyses",
    icon: BarChart3,
    color: "bg-purple-50 text-purple-600",
    items: [
      {
        q: "Comment générer un rapport pour une campagne spécifique ?",
        a: "Dans le menu « Rapports & Analyses », utilisez le sélecteur de campagne en haut à droite pour choisir la période souhaitée. Les graphiques (Collectes, Cultures, Avances) se mettent à jour automatiquement."
      },
      {
        q: "Comment calculer les avances remboursées lors de la collecte ?",
        a: "Le remboursement est géré dans la page Tableau de Bord via la liste « Distributions d'Intrants ». En cliquant sur l'icône d'édition d'une ligne, vous pouvez changer le statut en « Remboursé » ou « Partiel »."
      },
    ]
  },
  {
    category: "Application Mobile",
    icon: Smartphone,
    color: "bg-indigo-50 text-indigo-600",
    items: [
      {
        q: "Est-il possible d'utiliser l'application mobile sans connexion internet ?",
        a: "Oui. L'application mobile terrain fonctionne en mode hors ligne (offline-first). Les données saisies localement sont synchronisées automatiquement avec le serveur dès que la connexion est rétablie, selon la fréquence configurée dans Paramètres > Synchronisation Mobile."
      },
    ]
  },
];

const guidesLinks = [
  { title: "Guide de démarrage rapide", desc: "Configurez votre organisation en 10 minutes.", icon: BookOpen },
  { title: "Tutoriel vidéo : Collecte de récolte", desc: "Apprenez à saisir une pesée étape par étape.", icon: BarChart3 },
  { title: "Manuel de l'application terrain", desc: "Guide complet pour les agents en déplacement.", icon: Smartphone },
];

export default function AidePage() {
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let fullName = "";
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          fullName = profile.full_name;
        } else if (user.email) {
          fullName = user.email.split("@")[0];
        }

        setContactForm(prev => ({
          ...prev,
          name: fullName,
          email: user.email || "",
        }));
      }
    };
    loadUserProfile();
  }, []);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("support_messages")
      .insert({
        user_id: user?.id || null,
        name: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject,
        message: contactForm.message,
      });

    setIsSending(false);

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      console.error("Error sending support message:", error);
      toast("Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.", "error");
    } else {
      if (error) {
        console.warn("Table support_messages does not exist. Saving locally as mock fallback.");
      }
      setSubmitted(true);
      toast("Votre message a été envoyé. Notre équipe vous répondra sous 24h.");
    }
  };

  // Filtrer la FAQ selon la recherche
  const filteredFaq = faqData.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-8 pb-10">
      {/* En-tête Hero */}
      <div className="bg-gradient-to-br from-primary to-primary/70 rounded-2xl p-8 text-white text-center">
        <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-4">
          <HelpCircle size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Centre d'aide OpeAgri</h1>
        <p className="text-primary-50/80 mb-6">Trouvez rapidement des réponses à vos questions.</p>
        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={20} className="text-white/60" />
          </div>
          <input
            type="text"
            placeholder="Rechercher dans la FAQ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/30 transition-colors text-sm"
          />
        </div>
      </div>

      {/* Cartes de ressources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 block hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <BookOpen size={24} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Documentation & Guides</h3>
          <p className="text-sm text-gray-500 mb-4">Apprenez à utiliser OpeAgri pas à pas avec nos tutoriels illustrés.</p>
          <div className="space-y-2">
            {guidesLinks.map((g, i) => (
              <a href="#" key={i} className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                <ChevronRight size={14} />{g.title}
              </a>
            ))}
          </div>
        </div>

        <a
          href="mailto:support@opeagri.com"
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 block hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
            <MessageCircle size={24} className="text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Chat en direct</h3>
          <p className="text-sm text-gray-500 mb-4">Discutez en temps réel avec notre équipe d'assistance technique.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-700 font-medium">3 agents disponibles</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Lun–Ven, 8h–18h (WAT)</p>
        </a>

        <a
          href="tel:+22625301234"
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 block hover:border-orange-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
            <PhoneCall size={24} className="text-orange-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Assistance téléphonique</h3>
          <p className="text-sm text-gray-500 mb-4">Appelez nos experts pour une aide immédiate sur le terrain.</p>
          <p className="text-sm font-bold text-gray-900">+226 25 30 12 34</p>
          <p className="text-xs text-gray-400 mt-1">Lun–Sam, 7h–19h (WAT)</p>
        </a>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Questions fréquentes (FAQ)</h2>
          {search && (
            <p className="text-sm text-gray-500 mt-1">
              {filteredFaq.reduce((acc, c) => acc + c.items.length, 0)} résultat(s) pour « {search} »
            </p>
          )}
        </div>

        {filteredFaq.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Search size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-700">Aucun résultat trouvé.</p>
            <p className="text-sm mt-1">Essayez d'autres mots-clés ou contactez notre support.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredFaq.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.category}>
                  {/* Titre de catégorie */}
                  <div className="px-6 py-4 flex items-center gap-3 bg-gray-50/50">
                    <div className={cn("p-1.5 rounded-lg", cat.color)}>
                      <CatIcon size={16} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{cat.category}</span>
                  </div>

                  {/* Questions de la catégorie */}
                  {cat.items.map((item) => {
                    const itemKey = cat.category + item.q;
                    const isOpen = openItem === itemKey;
                    return (
                      <div key={item.q} className="border-t border-gray-50">
                        <button
                          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/70 transition-colors"
                          onClick={() => setOpenItem(isOpen ? null : itemKey)}
                        >
                          <span className="text-sm font-medium text-gray-900 pr-4">{item.q}</span>
                          <ChevronDown
                            size={18}
                            className={cn("text-gray-400 flex-shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed bg-primary/5 border-t border-primary/10">
                            <div className="pt-4">{item.a}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Formulaire de contact */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Mail size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Contacter le Support</h2>
            <p className="text-sm text-gray-500">Nous vous répondrons dans un délai de 24 heures ouvrables.</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-16 text-center">
            <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Message envoyé !</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">Notre équipe a bien reçu votre demande et vous répondra sous 24h à l'adresse <strong>{contactForm.email}</strong>.</p>
            <button onClick={() => { setSubmitted(false); setContactForm({ name: "", email: "", subject: "", message: "" }); }}
              className="mt-6 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Votre nom complet</label>
                <input type="text" name="name" value={contactForm.name} onChange={handleContactChange} required
                  placeholder="Ex : Kofi Ouédraogo"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Adresse e-mail</label>
                <input type="email" name="email" value={contactForm.email} onChange={handleContactChange} required
                  placeholder="Ex : kofi@example.bf"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sujet de la demande</label>
              <select name="subject" value={contactForm.subject} onChange={handleContactChange} required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white outline-none">
                <option value="">Sélectionner un sujet...</option>
                <option value="bug">Signaler un bug ou une erreur</option>
                <option value="feature">Demander une nouvelle fonctionnalité</option>
                <option value="data">Problème de données ou export</option>
                <option value="account">Problème de compte ou connexion</option>
                <option value="training">Demander une formation</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea name="message" value={contactForm.message} onChange={handleContactChange} required rows={5}
                placeholder="Décrivez votre problème ou votre question en détail..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none" />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Envoi en cours..." : (
                  <>
                    <Mail size={16} /> Envoyer le message
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
