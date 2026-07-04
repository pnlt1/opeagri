"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/toaster";
import { Modal } from "@/components/ui/modal";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { campaignSchema, firstIssueMessage } from "@/lib/validations";

import { 
  Plus, 
  MoreHorizontal, 
  Calendar,
  CheckCircle2,
  Clock,
  PlayCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const initialCampaigns = [
  {
    id: "CAMP-2026-01",
    name: "Saison des pluies 2026-2027",
    crop: "Coton, Sésame, Maïs",
    startDate: "2026-05-01",
    endDate: "2026-11-30",
    status: "En cours",
    progress: 45,
  },
  {
    id: "CAMP-2025-02",
    name: "Saison sèche 2025-2026",
    crop: "Maraîchage",
    startDate: "2025-12-01",
    endDate: "2026-04-30",
    status: "Terminée",
    progress: 100,
  },
  {
    id: "CAMP-2027-01",
    name: "Saison des pluies 2027-2028",
    crop: "Coton, Sésame",
    startDate: "2027-05-01",
    endDate: "2027-11-30",
    status: "Planifiée",
    progress: 0,
  },
];

export default function CampagnesPage() {
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else if (data) {
      const formattedData = data.map((c: any, idx: number) => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(c.id);
        const year = c.start_date ? new Date(c.start_date).getFullYear() : 2026;
        const displayId = isUUID
          ? `CAMP-${year}-${String(idx + 1).padStart(2, '0')}`
          : c.id;
        return {
          ...c,
          displayId,
          name: c.name,
          crop: "Cultures Mixtes", // Not in table, mock for UI
          startDate: c.start_date,
          endDate: c.end_date || "Non défini",
          status: c.status,
          progress: c.status === "Terminée" ? 100 : (c.status === "En cours" ? 45 : 0) // Mock logic for progress since it's not in DB
        };
      });
      setCampaignsList(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    crop: "",
    startDate: "",
    endDate: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = campaignSchema.safeParse({
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });
    if (!parsed.success) {
      toast(firstIssueMessage(parsed) ?? "Données invalides.");
      return;
    }

    const { error } = await supabase.from('campaigns').insert([{
      name: parsed.data.name,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate || null,
      status: "Planifiée"
    }]);

    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else {
      setIsModalOpen(false);
      toast(`Campagne "${formData.name}" créée avec succès !`);
      setFormData({ name: "", crop: "", startDate: "", endDate: "" });
      fetchCampaigns();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campagnes Agricoles</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez le cycle de vos différentes saisons agricoles.</p>
        </div>
        
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors w-full sm:w-auto justify-center"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
          Nouvelle Campagne
        </button>
      </div>

      <div className="md:bg-white md:dark:bg-gray-800 md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:dark:border-gray-700 md:overflow-hidden bg-transparent border-none shadow-none overflow-visible">
        
        {/* Vue Desktop (Tableau) */}
        <div className="hidden md:block overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom de la Campagne</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cultures Concernées</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Période</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progression</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {campaignsList.length > 0 ? campaignsList.map((camp, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{camp.name}</div>
                    <div className="text-xs text-gray-700 font-medium dark:text-gray-400">{camp.displayId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {camp.crop}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={14} className="text-gray-400" />
                      {camp.startDate} au {camp.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-32 flex items-center gap-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${camp.progress}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-600 font-medium dark:text-gray-400">{camp.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {camp.status === "Terminée" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        <CheckCircle2 size={12} />
                        Terminée
                      </span>
                    ) : camp.status === "En cours" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-leaf-light/20 text-leaf-dark border border-leaf-light/30">
                        <PlayCircle size={12} />
                        En cours
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <Clock size={12} />
                        Planifiée
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Dropdown
                      trigger={
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      }
                      align="right"
                    >
                      <DropdownItem onClick={() => {
                        setCampaignsList(prev => prev.map(c => c.id === camp.id ? { ...c, status: "En cours", progress: 10 } : c));
                        toast("La campagne a été démarrée.");
                      }}>Démarrer la campagne</DropdownItem>
                      <DropdownItem onClick={() => {
                        setCampaignsList(prev => prev.map(c => c.id === camp.id ? { ...c, status: "Terminée", progress: 100 } : c));
                        toast("La campagne est marquée comme terminée.");
                      }}>Clôturer</DropdownItem>
                      <DropdownItem 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                          setCampaignsList(prev => prev.filter(c => c.id !== camp.id));
                          toast(`Campagne ${camp.displayId} supprimée.`);
                        }}
                      >Supprimer</DropdownItem>
                    </Dropdown>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Aucune campagne enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vue Mobile (Cartes de liste) */}
        <div className="md:hidden flex flex-col gap-4 min-h-[300px]">
          {campaignsList.length > 0 ? campaignsList.map((camp, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{camp.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{camp.displayId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {camp.status === "Terminée" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      Terminée
                    </span>
                  ) : camp.status === "En cours" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-leaf-light/20 text-leaf-dark border border-leaf-light/30">
                      En cours
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      Planifiée
                    </span>
                  )}
                  <Dropdown
                    trigger={
                      <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    }
                    align="right"
                  >
                    <DropdownItem onClick={() => {
                      setCampaignsList(prev => prev.map(c => c.id === camp.id ? { ...c, status: "En cours", progress: 10 } : c));
                      toast("La campagne a été démarrée.");
                    }}>Démarrer la campagne</DropdownItem>
                    <DropdownItem onClick={() => {
                      setCampaignsList(prev => prev.map(c => c.id === camp.id ? { ...c, status: "Terminée", progress: 100 } : c));
                      toast("La campagne est marquée comme terminée.");
                    }}>Clôturer</DropdownItem>
                    <DropdownItem 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        setCampaignsList(prev => prev.filter(c => c.id !== camp.id));
                        toast(`Campagne ${camp.displayId} supprimée.`);
                      }}
                    >Supprimer</DropdownItem>
                  </Dropdown>
                </div>
              </div>
              
              {/* Separator Dashed */}
              <div className="border-b border-dashed border-gray-100 dark:border-gray-700/60 my-1"></div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Cultures Concernées :</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right">{camp.crop}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Période :</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-xs text-right">
                    {camp.startDate} au {camp.endDate}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Progression :</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${camp.progress}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">{camp.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center">
              Aucune campagne enregistrée.
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Campagne Agricole">
        <form className="space-y-4" onSubmit={handleAddCampaign}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Nom de la campagne</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Ex: Saison des pluies 2028" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Cultures visées</label>
            <input type="text" name="crop" value={formData.crop} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Ex: Coton, Maïs" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Date de début</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Date de fin</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Créer la campagne</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}