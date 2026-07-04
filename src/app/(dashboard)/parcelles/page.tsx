"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/toaster";
import { Modal } from "@/components/ui/modal";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { parcelSchema, firstIssueMessage } from "@/lib/validations";

import { 
  Search, 
  Filter, 
  Map as MapIcon, 
  List,
  MoreHorizontal,
  Download,
  Upload,
  MapPin,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpDown,
  ChevronRight,
  Layers
} from "lucide-react";
import { cn, exportToCSV } from "@/lib/utils";

// Mock data pour les parcelles
const initialParcels = [
  {
    id: "PAR-2026-001",
    producer: "Ouedraogo Ali",
    village: "Raynagor",
    area: 3.5,
    crop: "Coton",
    coordinates: "12.353, -1.534",
    status: "Cartographiée",
  },
  {
    id: "PAR-2026-002",
    producer: "Kaboré Moussa",
    village: "Koudougou",
    area: 1.2,
    crop: "Sésame",
    coordinates: "12.251, -2.361",
    status: "Cartographiée",
  },
  {
    id: "PAR-2026-003",
    producer: "Fati Sawadogo",
    village: "Ouahigouya",
    area: 0.8,
    crop: "Maïs",
    coordinates: "En attente",
    status: "En attente",
  },
  {
    id: "PAR-2026-004",
    producer: "Jean Ilboudo",
    village: "Ziniaré",
    area: 5.0,
    crop: "Coton",
    coordinates: "12.583, -1.298",
    status: "Cartographiée",
  },
  {
    id: "PAR-2026-005",
    producer: "Amadou Traoré",
    village: "Banfora",
    area: 2.1,
    crop: "Riz",
    coordinates: "10.633, -4.766",
    status: "Cartographiée",
  },
];

export default function ParcellesPage() {
  const [parcelsList, setParcelsList] = useState<any[]>([]);
  const [producersList, setProducersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchParcels = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('parcels').select('*, producers(first_name, last_name)').order('created_at', { ascending: false });
    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else if (data) {
      const formattedData = data.map((p: any, idx: number) => {
        // Generate a human-readable business ID if the raw id is a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(p.id);
        const displayId = isUUID
          ? `PARC-2026-${String(idx + 1).padStart(3, '0')}`
          : p.id;
        return {
          ...p,
          displayId,
          producer: p.producers ? `${p.producers.first_name} ${p.producers.last_name}` : "Inconnu",
          area: p.area_ha
        };
      });
      setParcelsList(formattedData);
    }
    setLoading(false);
  };

  const fetchProducers = async () => {
    const { data, error } = await supabase.from('producers').select('id, first_name, last_name, village').order('first_name', { ascending: true });
    if (error) {
      console.error("Supabase error (producteurs):", error);
      toast("Une erreur est survenue lors du chargement des producteurs.", "error");
    } else if (data) {
      setProducersList(data);
    }
  };

  useEffect(() => {
    fetchParcels();
    fetchProducers();
  }, []);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [viewingParcel, setViewingParcel] = useState<any>(null);

  // Filtres et Tris
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [sortBy, setSortBy] = useState("none");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Formulaire
  const [formData, setFormData] = useState({ producer: "", area: "", crop: "Coton", coordinates: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddParcel = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = parcelSchema.safeParse({
      producerId: formData.producer,
      crop: formData.crop,
      area: parseFloat(formData.area) || 0,
      coordinates: formData.coordinates,
    });
    if (!parsed.success) {
      toast(firstIssueMessage(parsed) ?? "Données invalides.");
      return;
    }

    const selectedProducer = producersList.find(p => p.id === parsed.data.producerId);
    const village = selectedProducer ? selectedProducer.village : "Inconnu";

    const { error } = await supabase.from('parcels').insert([{
      producer_id: parsed.data.producerId,
      village: village,
      area_ha: parsed.data.area,
      crop: parsed.data.crop,
      coordinates: parsed.data.coordinates || "En attente",
      status: parsed.data.coordinates ? "Cartographiée" : "En attente"
    }]);

    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else {
      setIsModalOpen(false);
      toast(`Parcelle ajoutée avec succès !`);
      setFormData({ producer: "", area: "", crop: "Coton", coordinates: "" });
      fetchParcels();
    }
  };

  const toggleSortArea = () => {
    if (sortBy === "area-desc") setSortBy("area-asc");
    else setSortBy("area-desc");
  };

  // 1. Filtrer
  let filtered = parcelsList.filter(p => {
    const matchesSearch =
      (p.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.producer || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.village || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.crop || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "Tous" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 2. Trier
  if (sortBy === "area-desc") filtered = [...filtered].sort((a, b) => b.area - a.area);
  else if (sortBy === "area-asc") filtered = [...filtered].sort((a, b) => a.area - b.area);

  // 3. Paginer
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentParcels = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-10">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parcelles</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Suivi géographique et informations sur les parcelles.</p>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-3 w-full sm:w-auto">
          <button 
            className="flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto px-3 py-2 sm:px-4 sm:py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            title="Exporter"
            onClick={() => {
              exportToCSV("Parcelles_OpeAgri", filtered, {
                displayId: "ID", producer: "Producteur", village: "Village",
                area: "Surface (ha)", crop: "Culture", coordinates: "Coordonnées", status: "Statut"
              });
              toast("Export CSV lancé avec succès.");
            }}
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <label 
            className="flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto px-3 py-2 sm:px-4 sm:py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer flex-shrink-0"
            title="Importer CSV"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Importer</span>
            <input type="file" accept=".csv" className="hidden" onChange={() => toast("Import CSV à venir.")} />
          </label>
          <button 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 sm:h-auto px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Nouvelle Parcelle
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center mt-5">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Filtrer ce tableau..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50/50 whitespace-nowrap">
            <span className="font-medium text-gray-900">{filtered.length}</span> résultats
          </div>
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center whitespace-nowrap">
                <Filter size={16} />
                {statusFilter === "Tous" ? "Filtres" : `Statut: ${statusFilter}`}
              </button>
            }
          >
            <DropdownItem onClick={() => { setStatusFilter("Tous"); setCurrentPage(1); }}>Tous les statuts</DropdownItem>
            <DropdownItem onClick={() => { setStatusFilter("Cartographiée"); setCurrentPage(1); }}>Statut: Cartographiée</DropdownItem>
            <DropdownItem onClick={() => { setStatusFilter("En attente"); setCurrentPage(1); }}>Statut: En attente</DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="md:bg-white md:dark:bg-gray-800 md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:dark:border-gray-700 md:overflow-hidden bg-transparent border-none shadow-none overflow-visible">
          
          {/* Vue Desktop (Table) */}
          <div className="hidden md:block overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parcelle</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Culture</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={toggleSortArea}>
                    <div className="flex items-center justify-end gap-1">
                      Surface <ArrowUpDown size={12} className={sortBy !== "none" ? "text-primary" : "text-gray-400"} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localisation</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentParcels.length > 0 ? currentParcels.map((parcel, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <Layers size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{parcel.producer}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{parcel.displayId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-earth-50 text-earth-dark border border-earth-100">
                        {parcel.crop}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                      {parcel.area?.toFixed(1) || "0.0"} ha
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 font-medium">
                          <MapPin size={14} className="text-earth-light" />
                          {parcel.village}
                        </div>
                        <div className="text-xs text-gray-500 font-mono dark:text-gray-400">{parcel.coordinates}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {parcel.status === "Cartographiée" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-leaf-light/20 text-leaf-dark border border-leaf-light/30">
                          <CheckCircle2 size={12} /> Cartographiée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                          <Clock size={12} /> En attente
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
                        <DropdownItem onClick={() => setViewingParcel(parcel)}>Détails</DropdownItem>
                        <DropdownItem onClick={() => {
                          setParcelsList(prev => prev.map(p => p.id === parcel.id
                            ? { ...p, status: p.status === "Cartographiée" ? "En attente" : "Cartographiée" } : p));
                          toast(`Statut de ${parcel.displayId} mis à jour.`);
                        }}>Changer Statut</DropdownItem>
                        <DropdownItem
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            setParcelsList(prev => prev.filter(p => p.id !== parcel.id));
                            toast(`Parcelle ${parcel.displayId} supprimée.`);
                          }}
                        >Supprimer</DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      Aucune parcelle ne correspond à votre recherche/filtre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Vue Mobile (Cartes) */}
          <div className="md:hidden flex flex-col gap-4 min-h-[400px]">
            {currentParcels.length > 0 ? currentParcels.map((parcel, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative flex flex-col gap-3 cursor-pointer group"
                onClick={() => setViewingParcel(parcel)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Layers size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{parcel.producer}</div>
                      <div className="text-xs text-gray-500 font-medium dark:text-gray-400">{parcel.displayId}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {parcel.status === "Cartographiée" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-leaf-light/20 text-leaf-dark border border-leaf-light/30">
                        Cartographiée
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-100">
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
                      <DropdownItem onClick={() => setViewingParcel(parcel)}>Détails</DropdownItem>
                      <DropdownItem onClick={() => {
                        setParcelsList(prev => prev.map(p => p.id === parcel.id
                          ? { ...p, status: p.status === "Cartographiée" ? "En attente" : "Cartographiée" } : p));
                        toast(`Statut de ${parcel.displayId} mis à jour.`);
                      }}>Changer Statut</DropdownItem>
                      <DropdownItem 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                          setParcelsList(prev => prev.filter(p => p.id !== parcel.id));
                          toast(`Parcelle ${parcel.displayId} supprimée.`);
                        }}
                      >Supprimer</DropdownItem>
                    </Dropdown>
                  </div>
                </div>
                
                {/* Separator Dashed */}
                <div className="border-b border-dashed border-gray-100 dark:border-gray-700/60 my-1"></div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Culture :</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-earth-50 text-earth-dark border border-earth-100">
                      {parcel.crop}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Surface :</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {parcel.area?.toFixed(1) || "0.0"} ha
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Localisation :</span>
                    <div className="flex items-start gap-1 text-right justify-end">
                      <MapPin size={14} className="text-earth-light flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white text-xs block">{parcel.village}</span>
                        <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{parcel.coordinates}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center">
                Aucune parcelle ne correspond à votre recherche/filtre.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)} sur {filtered.length} parcelles</span>
              <div className="flex items-center gap-1">
                <button
                  className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  disabled={currentPage === 1}
                  onClick={handlePrevPage}
                >
                  &lt; Préc
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "px-3 py-1 rounded transition-colors",
                      currentPage === idx + 1 ? "bg-primary text-white" : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                >
                  Suiv &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Carte */}
      {viewMode === 'map' && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 min-h-[400px] relative overflow-hidden">
          {/* Grille style carte */}
          <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentParcels.map((parcel, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <MapIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{parcel.producer}</h4>
                      <p className="text-xs text-gray-500">{parcel.displayId}</p>
                    </div>
                  </div>
                  {parcel.status === "Cartographiée"
                    ? <CheckCircle2 size={16} className="text-leaf-dark" />
                    : <Clock size={16} className="text-orange-500" />
                  }
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                  <div className="flex justify-between">
                    <span>Culture :</span>
                    <span className="font-medium text-gray-900">{parcel.crop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surface :</span>
                    <span className="font-medium text-gray-900">{parcel.area?.toFixed(1) || "0.0"} ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Village :</span>
                    <span className="font-medium text-gray-900 flex items-center gap-1">
                      <MapPin size={12} className="text-earth-light" />
                      {parcel.village}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {parcel.coordinates}
                  </span>
                  <button
                    onClick={() => setViewingParcel(parcel)}
                    className="text-primary text-xs font-medium hover:underline"
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
            {currentParcels.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-500">
                Aucune parcelle trouvée.
              </div>
            )}
          </div>

          {/* Pagination pour la vue carte */}
          {totalPages > 1 && (
            <div className="relative z-10 mt-6 flex items-center justify-center gap-1 text-sm text-gray-500">
              <button className="px-3 py-1 border border-gray-200 bg-white rounded hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled={currentPage === 1} onClick={handlePrevPage}>&lt;</button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button key={idx} className={cn("px-3 py-1 rounded transition-colors", currentPage === idx + 1 ? "bg-primary text-white" : "border border-gray-200 bg-white hover:bg-gray-50")} onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
              ))}
              <button className="px-3 py-1 border border-gray-200 bg-white rounded hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled={currentPage === totalPages} onClick={handleNextPage}>&gt;</button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Parcelle">
        <form className="space-y-4" onSubmit={handleAddParcel}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Producteur</label>
            <select name="producer" value={formData.producer} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" required>
              <option value="">Sélectionner...</option>
              {producersList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.village || "Sans village"})
                </option>
              ))}
            </select>
            {producersList.length === 0 && (
              <p className="text-xs text-orange-600">Aucun producteur enregistré. Ajoutez-en un d'abord.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Surface (ha)</label>
              <input type="number" step="0.1" name="area" value={formData.area} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: 2.5" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Culture</label>
              <select name="crop" value={formData.crop} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" required>
                <option value="Coton">Coton</option>
                <option value="Sésame">Sésame</option>
                <option value="Maïs">Maïs</option>
                <option value="Riz">Riz</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Coordonnées GPS (Optionnel)</label>
            <input type="text" name="coordinates" value={formData.coordinates} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: 12.353, -1.534" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Enregistrer</button>
          </div>
        </form>
      </Modal>

      {/* Modale de Détails de la Parcelle */}
      <Modal isOpen={!!viewingParcel} onClose={() => setViewingParcel(null)} title="Détails de la Parcelle">
        {viewingParcel && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MapIcon size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{viewingParcel.producer}</h3>
                <p className="text-sm text-gray-500">{viewingParcel.displayId} · {viewingParcel.status === "Cartographiée" ? "Géolocalisée avec succès" : "Coordonnées en attente"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Producteur</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{viewingParcel.producer}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Localisation</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {viewingParcel.village}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Culture</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{viewingParcel.crop}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Surface</p>
                <p className="text-sm font-bold text-primary">{viewingParcel.area} Hectares</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Coordonnées GPS</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-mono text-gray-700 dark:text-gray-300">
                  {viewingParcel.coordinates}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => setViewingParcel(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Fermer</button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}