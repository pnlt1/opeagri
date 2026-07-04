"use client";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/toaster";
import { Modal } from "@/components/ui/modal";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { harvestSchema, firstIssueMessage } from "@/lib/validations";

import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Scale,
  Truck,
  Download,
  ChevronRight
} from "lucide-react";
import { cn, exportToCSV } from "@/lib/utils";

// Mock data pour les collectes de récoltes
const initialCollections = [
  {
    id: "COL-2026-001",
    producer: "Ouedraogo Ali",
    village: "Raynagor",
    crop: "Coton Grain",
    weight: 2450,
    quality: "Grade A",
    date: "10/11/2026",
    status: "Pesée validée",
  },
  {
    id: "COL-2026-002",
    producer: "Kaboré Moussa",
    village: "Koudougou",
    crop: "Sésame Blanc",
    weight: 850,
    quality: "Grade A",
    date: "09/11/2026",
    status: "Payé",
  },
  {
    id: "COL-2026-003",
    producer: "Sawadogo Fati",
    village: "Ouahigouya",
    crop: "Maïs Blanc",
    weight: 1200,
    quality: "Standard",
    date: "08/11/2026",
    status: "En attente paiement",
  },
  {
    id: "COL-2026-004",
    producer: "Ilboudo Jean",
    village: "Ziniaré",
    crop: "Coton Grain",
    weight: 3100,
    quality: "Grade B",
    date: "08/11/2026",
    status: "Pesée validée",
  },
];

export default function CollectePage() {
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [parcelsList, setParcelsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchParcels = async () => {
    const { data, error } = await supabase.from('parcels').select('id, crop, village, producers(first_name, last_name)').order('created_at', { ascending: false });
    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else if (data) {
      setParcelsList(data);
    }
  };

  const fetchCollections = async () => {
    setLoading(true);
    // Since we didn't populate parcel_id or have real harvests, we'll just query without joins if no relations exist,
    // but the schema says parcel_id references parcels. Let's just fetch from harvests.
    // For prototyping, if harvests is empty, it will be empty.
    const { data, error } = await supabase.from('harvests').select('*, parcels(crop, producers(first_name, last_name, village))').order('created_at', { ascending: false });
    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else if (data) {
      const formattedData = data.map((c: any, idx: number) => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(c.id);
        const displayId = isUUID
          ? `COL-2026-${String(idx + 1).padStart(3, '0')}`
          : c.id;
        return {
          ...c,
          displayId,
          producer: c.parcels?.producers ? `${c.parcels.producers.first_name} ${c.parcels.producers.last_name}` : "Inconnu",
          village: c.parcels?.producers?.village || "Inconnu",
          crop: c.parcels?.crop || "Inconnue",
          weight: c.quantity_kg,
          date: new Date(c.date).toLocaleDateString('fr-FR'),
        };
      });
      setCollectionsList(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCollections();
    fetchParcels();
  }, []);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Tous");

  // Impression de reçu
  const [printReceiptData, setPrintReceiptData] = useState<any>(null);

  const [formData, setFormData] = useState({
    parcelId: "",
    quality: "Grade A",
    weight: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    const qualityCode = formData.quality === 'Grade A' ? 'A' : (formData.quality === 'Grade B' ? 'B' : 'C');
    const parsed = harvestSchema.safeParse({
      parcelId: formData.parcelId,
      quality: qualityCode,
      weight: parseFloat(formData.weight) || 0,
    });
    if (!parsed.success) {
      toast(firstIssueMessage(parsed) ?? "Données invalides.");
      return;
    }

    const { error } = await supabase.from('harvests').insert([{
      parcel_id: parsed.data.parcelId,
      date: new Date().toISOString().split('T')[0],
      quantity_kg: parsed.data.weight,
      quality: parsed.data.quality,
      status: "Pesée validée"
    }]);

    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else {
      setIsModalOpen(false);
      toast(`Pesée de ${parsed.data.weight}kg enregistrée avec succès !`);
      setFormData({ parcelId: "", quality: "Grade A", weight: "" });
      fetchCollections();
    }
  };

  const filteredCollections = collectionsList.filter(c => {
    const matchesSearch = 
      (c.id || "").toLowerCase().includes(search.toLowerCase()) || 
      (c.producer || "").toLowerCase().includes(search.toLowerCase()) || 
      (c.village || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "Tous" || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalWeight = useMemo(() => {
    return collectionsList.reduce((acc, curr) => acc + (curr.weight || curr.quantity_kg || 0), 0);
  }, [collectionsList]);

  // Valeur estimée arbitraire (ex: 300 FCFA le kg en moyenne)
  const estimatedValue = useMemo(() => {
    return totalWeight * 300;
  }, [totalWeight]);

  // Camions (ex: 1 camion = 3 tonnes)
  const trucks = useMemo(() => {
    return Math.ceil(totalWeight / 3000);
  }, [totalWeight]);

  // Totaux par culture
  const cropTotals = useMemo(() => {
    const map: Record<string, number> = {};
    collectionsList.forEach(c => {
      const crop = c.crop || "Inconnue";
      const w = c.weight || c.quantity_kg || 0;
      map[crop] = (map[crop] || 0) + w;
    });
    return Object.entries(map).map(([crop, weight]) => ({ crop, weight })).sort((a, b) => b.weight - a.weight);
  }, [collectionsList]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collecte des Récoltes</h1>
          <p className="text-sm text-gray-500 mt-1">Enregistrez les pesées et suivez les volumes collectés.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              exportToCSV("Collectes_OpeAgri", filteredCollections, {
                id: "N° Reçu",
                producer: "Producteur",
                village: "Village",
                crop: "Culture",
                quality: "Qualité",
                weight: "Poids Net (kg)",
                date: "Date",
                status: "Statut"
              });
              toast("Export CSV lancé avec succès.");
            }}
          >
            <Download size={16} />
            Exporter
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Nouvelle Pesée
          </button>
        </div>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-500">Volume Total</h3>
            <div className="p-2 bg-primary-50 rounded-lg">
              <Scale size={18} className="text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalWeight.toLocaleString('fr-FR')} <span className="text-base font-normal text-gray-500">kg</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-500">Valeur Estimée</h3>
            <div className="p-2 bg-earth-50 rounded-lg">
              <span className="text-earth-dark font-bold">F</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{(estimatedValue / 1000000).toFixed(1)}M <span className="text-base font-normal text-gray-500">FCFA</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-500">Camions Chargés</h3>
            <div className="p-2 bg-leaf-light/20 rounded-lg">
              <Truck size={18} className="text-leaf-dark" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{trucks}</div>
        </div>
      </div>

      {/* Totaux par culture */}
      {cropTotals.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Stock Collecté par Culture</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cropTotals.map(({ crop, weight }) => (
              <div key={crop} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">{crop}</p>
                <p className="text-xl font-bold text-gray-900">{(weight / 1000).toFixed(2)} <span className="text-sm font-normal text-gray-500">T</span></p>
                <p className="text-xs text-gray-400 mt-0.5">{weight.toLocaleString('fr-FR')} kg</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un reçu, producteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Dropdown
            trigger={
              <button 
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
              >
                <Filter size={16} />
                {statusFilter === "Tous" ? "Filtres" : `Statut: ${statusFilter}`}
              </button>
            }
          >
            <DropdownItem onClick={() => setStatusFilter("Tous")}>Tous les statuts</DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("Payé")}>Statut: Payé</DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("Pesée validée")}>Statut: Pesée validée</DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("En attente paiement")}>Statut: En attente</DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Tableau des collectes */}
      <div className="md:bg-white md:dark:bg-gray-800 md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:dark:border-gray-700 md:overflow-hidden bg-transparent border-none shadow-none overflow-visible">
        
        {/* Vue Desktop (Tableau) */}
        <div className="hidden md:block overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">N° Reçu</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producteur</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Culture & Qualité</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Poids Net</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCollections.length > 0 ? filteredCollections.map((col, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {col.displayId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{col.producer}</div>
                    <div className="text-xs text-gray-700 font-medium dark:text-gray-400">{col.village}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{col.crop}</div>
                    <div className="text-xs text-earth-DEFAULT font-medium">{col.quality}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                    {col.weight?.toLocaleString('fr-FR') || "0"} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                    {col.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {col.status === "Payé" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Payé
                      </span>
                    ) : col.status === "Pesée validée" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Pesée validée
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        En attente paiement
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
                        setCollectionsList(prev => prev.map(c => c.id === col.id ? { ...c, status: "Payé" } : c));
                        toast(`Paiement validé pour le reçu ${col.displayId}`);
                      }}>Marquer comme payé</DropdownItem>
                      <DropdownItem onClick={() => setPrintReceiptData(col)}>Imprimer reçu</DropdownItem>
                      <DropdownItem 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                          setCollectionsList(prev => prev.filter(c => c.id !== col.id));
                          toast(`Reçu ${col.displayId} annulé.`);
                        }}
                      >Annuler la pesée</DropdownItem>
                    </Dropdown>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Aucune collecte ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vue Mobile (Cartes de liste) */}
        <div className="md:hidden flex flex-col gap-4 min-h-[400px]">
          {filteredCollections.length > 0 ? filteredCollections.map((col, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    <Scale size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{col.producer}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{col.displayId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {col.status === "Payé" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                      Payé
                    </span>
                  ) : col.status === "Pesée validée" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Pesée validée
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                      En attente
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
                      setCollectionsList(prev => prev.map(c => c.id === col.id ? { ...c, status: "Payé" } : c));
                      toast(`Paiement validé pour le reçu ${col.displayId}`);
                    }}>Marquer comme payé</DropdownItem>
                    <DropdownItem onClick={() => setPrintReceiptData(col)}>Imprimer reçu</DropdownItem>
                    <DropdownItem 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        setCollectionsList(prev => prev.filter(c => c.id !== col.id));
                        toast(`Reçu ${col.displayId} annulé.`);
                      }}
                    >Annuler la pesée</DropdownItem>
                  </Dropdown>
                </div>
              </div>
              
              {/* Separator Dashed */}
              <div className="border-b border-dashed border-gray-100 dark:border-gray-700/60 my-1"></div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Culture & Qualité:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-earth-50 text-earth-dark border border-earth-100">
                    {col.crop} · {col.quality}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Poids Net:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {col.weight?.toLocaleString('fr-FR') || "0"} kg
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Localité:</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-xs">{col.village}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Date:</span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">{col.date}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center">
              Aucune collecte ne correspond à votre recherche.
            </div>
          )}
        </div>
      </div>

      {/* Modale d'ajout */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Pesée">
        <form className="space-y-4" onSubmit={handleAddCollection}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Parcelle</label>
            <select name="parcelId" value={formData.parcelId} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="">Sélectionner une parcelle...</option>
              {parcelsList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.producers ? `${p.producers.first_name} ${p.producers.last_name}` : "Producteur inconnu"} — {p.crop} ({p.village})
                </option>
              ))}
            </select>
            {parcelsList.length === 0 && (
              <p className="text-xs text-orange-600">Aucune parcelle enregistrée. Ajoutez-en une depuis la page Parcelles.</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Qualité</label>
              <select name="quality" value={formData.quality} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Poids Net (kg)</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Ex: 1200" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Enregistrer</button>
          </div>
        </form>
      </Modal>

      {/* Modale d'impression de reçu */}
      <Modal isOpen={!!printReceiptData} onClose={() => setPrintReceiptData(null)} title={`Reçu N° ${printReceiptData?.displayId || ''}`}>
        {printReceiptData && (
          <div className="space-y-6">
            {/* Zone imprimable (design ticket) */}
            <div id="print-receipt-area" className="p-6 bg-white border border-gray-200 rounded-lg max-w-sm mx-auto shadow-sm print:shadow-none print:border-none print:p-0">
              <div className="text-center border-b border-gray-200 pb-4 mb-4 border-dashed">
                <h3 className="font-bold text-xl text-gray-900">OPEAGRI</h3>
                <p className="text-sm text-gray-500">Reçu de Collecte</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">N° Reçu:</span><span className="font-medium text-gray-900">{printReceiptData.displayId}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date:</span><span className="font-medium text-gray-900">{printReceiptData.date}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Agent:</span><span className="font-medium text-gray-900">Agent Demo</span></div>
                <div className="h-px bg-gray-100 my-2 border-dashed border-t"></div>
                <div className="flex justify-between"><span className="text-gray-500">Producteur:</span><span className="font-medium text-gray-900 text-right">{printReceiptData.producer}<br/><span className="text-xs text-gray-500">{printReceiptData.village}</span></span></div>
                <div className="flex justify-between"><span className="text-gray-500">Culture:</span><span className="font-medium text-gray-900">{printReceiptData.crop}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Qualité:</span><span className="font-medium text-gray-900">{printReceiptData.quality}</span></div>
                <div className="h-px bg-gray-100 my-2 border-dashed border-t"></div>
                <div className="flex justify-between text-base"><span className="font-medium text-gray-900">POIDS NET:</span><span className="font-bold text-gray-900">{printReceiptData.weight.toLocaleString('fr-FR')} kg</span></div>
              </div>
              <div className="text-center border-t border-gray-200 pt-4 mt-6 border-dashed">
                <p className="text-xs text-gray-500 italic">Signature / Empreinte</p>
                <div className="h-16 mt-2 rounded border border-gray-100 bg-gray-50"></div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 print:hidden">
              <button
                onClick={() => setPrintReceiptData(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 flex items-center gap-2"
              >
                Lancer l'impression
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}