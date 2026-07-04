"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/toaster";
import { Modal } from "@/components/ui/modal";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Download,
  Upload,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ChevronRight
} from "lucide-react";
import { cn, exportToCSV } from "@/lib/utils";
import { producerSchema, firstIssueMessage } from "@/lib/validations";

// Mock data initial pour les producteurs
const initialProducers = [
  {
    id: "PRD-2026-001",
    firstName: "Ali",
    lastName: "Ouedraogo",
    village: "Raynagor",
    cooperative: "Coopérative Wend-Panga",
    phone: "+226 70 12 34 56",
    area: 3.5,
    status: "Actif",
  },
  {
    id: "PRD-2026-002",
    firstName: "Moussa",
    lastName: "Kaboré",
    village: "Koudougou",
    cooperative: "Union des Producteurs",
    phone: "+226 71 23 45 67",
    area: 1.2,
    status: "Actif",
  },
  {
    id: "PRD-2026-003",
    firstName: "Fati",
    lastName: "Sawadogo",
    village: "Ouahigouya",
    cooperative: "Coopérative Yennenga",
    phone: "+226 72 34 56 78",
    area: 0.8,
    status: "Actif",
  },
  {
    id: "PRD-2026-004",
    firstName: "Jean",
    lastName: "Ilboudo",
    village: "Ziniaré",
    cooperative: "Groupement Nabonswendé",
    phone: "+226 73 45 67 89",
    area: 5.0,
    status: "Suspendu",
  },
  {
    id: "PRD-2026-005",
    firstName: "Amadou",
    lastName: "Traoré",
    village: "Banfora",
    cooperative: "Coopérative Cascades",
    phone: "+226 74 56 78 90",
    area: 2.1,
    status: "Actif",
  },
  {
    id: "PRD-2026-006",
    firstName: "Awa",
    lastName: "Diallo",
    village: "Dori",
    cooperative: "Union des Eleveurs et Agriculteurs",
    phone: "+226 75 67 89 01",
    area: 4.2,
    status: "Actif",
  },
];

export default function ProducteursPage() {
  const [producersList, setProducersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch producers
  const fetchProducers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('producers').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else if (data) {
      // Trier par date de création croissante (ou par UUID s'il y a égalité) pour attribuer des codes séquentiels stables
      const sorted = [...data].sort((a, b) => {
        const timeDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (timeDiff !== 0) return timeDiff;
        return a.id.localeCompare(b.id);
      });
      
      const mapped = sorted.map((p, index) => ({
        ...p,
        code: `PRD-2026-${String(index + 1).padStart(3, '0')}`
      }));
      
      // Retrier en ordre décroissant de création pour l'affichage par défaut (du plus récent au plus ancien)
      const displayList = mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setProducersList(displayList);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducers();
  }, []);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducer, setEditingProducer] = useState<any>(null);
  
  // Filtres et Tris
  const [statusFilter, setStatusFilter] = useState("Tous"); // "Tous", "Actif", "Suspendu"
  const [sortBy, setSortBy] = useState("none"); // "none", "area-desc", "area-asc"
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Formulaire Nouvel Ajout
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    village: "",
    cooperative: "",
    area: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProducer = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = producerSchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
      village: formData.village,
      cooperative: formData.cooperative,
      phone: formData.phone,
      area: parseFloat(formData.area) || 0,
    });
    if (!parsed.success) {
      toast(firstIssueMessage(parsed) ?? "Données invalides.");
      return;
    }

    const { error } = await supabase.from('producers').insert([{
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      village: parsed.data.village,
      cooperative: parsed.data.cooperative || "Indépendant",
      phone: parsed.data.phone,
      area_ha: parsed.data.area,
      status: "Actif"
    }]);

    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else {
      setIsModalOpen(false);
      toast(`Producteur ${formData.firstName} ${formData.lastName} ajouté avec succès !`);
      setFormData({ firstName: "", lastName: "", phone: "", village: "", cooperative: "", area: "" });
      fetchProducers();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProducer) return;

    const parsed = producerSchema.safeParse({
      firstName: editingProducer.firstName,
      lastName: editingProducer.lastName,
      village: editingProducer.village,
      cooperative: editingProducer.cooperative,
      phone: editingProducer.phone,
      area: Number(editingProducer.area) || 0,
    });
    if (!parsed.success) {
      toast(firstIssueMessage(parsed) ?? "Données invalides.");
      return;
    }

    const { error } = await supabase.from('producers').update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      village: parsed.data.village,
      cooperative: parsed.data.cooperative,
      phone: parsed.data.phone,
      area_ha: parsed.data.area,
      status: editingProducer.status
    }).eq('id', editingProducer.id);

    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else {
      setEditingProducer(null);
      toast(`Producteur ${editingProducer.firstName || editingProducer.first_name} mis à jour avec succès !`);
      fetchProducers();
    }
  };

  const toggleSortArea = () => {
    if (sortBy === "area-desc") setSortBy("area-asc");
    else setSortBy("area-desc");
  };

  const handleToggleStatus = async (producer: any) => {
    const newStatus = producer.status === "Actif" ? "Suspendu" : "Actif";
    const { error } = await supabase.from('producers').update({ status: newStatus }).eq('id', producer.id);
    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else {
      toast(`Statut de ${producer.firstName || producer.first_name} mis à jour.`);
      fetchProducers();
    }
  };

  const handleDeleteProducer = async (producer: any) => {
    const { error } = await supabase.from('producers').delete().eq('id', producer.id);
    if (error) {
      console.error("Supabase error:", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
    } else {
      toast(`${producer.firstName || producer.first_name} a été supprimé.`);
      fetchProducers();
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split('\n');
      const newProducers: any[] = [];
      
      // Basic CSV parsing (assuming format: Prénom,Nom,Village,Coopérative,Téléphone,Surface)
      // On ignore la première ligne (en-tête)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        if (cols.length >= 6) {
           const newId = `PRD-IMP-${Math.floor(Math.random() * 10000)}`;
           newProducers.push({
             id: newId,
             firstName: cols[0]?.trim() || "Inconnu",
             lastName: cols[1]?.trim() || "",
             village: cols[2]?.trim() || "Inconnu",
             cooperative: cols[3]?.trim() || "Indépendant",
             phone: cols[4]?.trim() || "",
             area: parseFloat(cols[5]?.trim()) || 0,
             status: "Actif"
           });
        }
      }
      
      if (newProducers.length > 0) {
        setProducersList(prev => [...newProducers, ...prev]);
        toast(`${newProducers.length} producteurs importés avec succès !`);
      } else {
        toast("Le fichier CSV est vide ou mal formaté.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // 1. Filtrer par Recherche Globale et Statut
  let filtered = producersList.filter(p => {
    const matchesSearch = 
      (p.firstName || p.first_name || "").toLowerCase().includes(search.toLowerCase()) || 
      (p.lastName || p.last_name || "").toLowerCase().includes(search.toLowerCase()) || 
      (p.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || "").includes(search);
    
    const matchesStatus = statusFilter === "Tous" || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 2. Trier
  if (sortBy === "area-desc") {
    filtered.sort((a, b) => (b.area || b.area_ha || 0) - (a.area || a.area_ha || 0));
  } else if (sortBy === "area-asc") {
    filtered.sort((a, b) => (a.area || a.area_ha || 0) - (b.area || b.area_ha || 0));
  }

  // 3. Paginer
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducers = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Producteurs</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Gérez la base de données de vos producteurs agricoles.</p>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-3 w-full sm:w-auto">
          <button 
            className="flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto px-3 py-2 sm:px-4 sm:py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            title="Exporter"
            onClick={() => {
              exportToCSV("Producteurs_OpeAgri", filtered, {
                id: "ID",
                firstName: "Prénom",
                lastName: "Nom",
                village: "Village",
                cooperative: "Coopérative",
                phone: "Téléphone",
                area: "Surface (ha)",
                status: "Statut"
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
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          </label>
          <button 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 sm:h-auto px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Nouveau Producteur
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4 mt-5">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
          <div className="relative w-full sm:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Filtrer ce tableau..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg text-sm focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center h-9">
              <strong className="text-gray-900 dark:text-white mr-1">{filtered.length}</strong> résultats
            </span>
            <div className="flex items-center">
              <Dropdown
                trigger={
                  <button 
                    className="flex items-center justify-center gap-2 h-9 px-4 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 whitespace-nowrap"
                  >
                    <Filter size={16} />
                    <span className="hidden sm:inline">{statusFilter === "Tous" ? "Filtres" : `Statut: ${statusFilter}`}</span>
                  </button>
                }
              >
                <DropdownItem onClick={() => { setStatusFilter("Tous"); setCurrentPage(1); }}>Tous les statuts</DropdownItem>
                <DropdownItem onClick={() => { setStatusFilter("Actif"); setCurrentPage(1); }}>Statut: Actif</DropdownItem>
                <DropdownItem onClick={() => { setStatusFilter("Suspendu"); setCurrentPage(1); }}>Statut: Suspendu</DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des producteurs (Desktop) & Cartes (Mobile) */}
      <div className="md:bg-white md:dark:bg-gray-800 md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:dark:border-gray-700 md:overflow-hidden bg-transparent border-none shadow-none overflow-visible">
        
        {/* Vue Desktop */}
        <div className="hidden md:block overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producteur</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localisation</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={toggleSortArea}>
                  <div className="flex items-center justify-end gap-1">
                    Surface <ArrowUpDown size={12} className={sortBy !== "none" ? "text-primary" : "text-gray-400"} />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {currentProducers.length > 0 ? currentProducers.map((producer, i) => (
                <tr 
                  key={i} 
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                  onClick={() => setEditingProducer({ ...producer, firstName: producer.first_name || producer.firstName || "", lastName: producer.last_name || producer.lastName || "", area: producer.area_ha || producer.area || 0 })}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold text-sm uppercase">
                        {(producer.firstName || producer.first_name)[0]}{(producer.lastName || producer.last_name)[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{(producer.firstName || producer.first_name)} {(producer.lastName || producer.last_name)}</div>
                        <div className="text-xs text-gray-500 font-medium dark:text-gray-400">{producer.code || producer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <MapPin size={14} className="text-earth-light mt-0.5 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{producer.village}</span>
                      </div>
                      <div className="text-xs text-gray-900 font-semibold dark:text-gray-300 pl-5 leading-tight">{producer.cooperative}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                      <Phone size={14} className="text-gray-500 dark:text-gray-400" />
                      {producer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white text-right">
                    {(producer.area || producer.area_ha).toFixed(1)} ha
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {producer.status === "Actif" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-leaf-light/20 text-leaf-dark dark:text-leaf-light border border-leaf-light/30">
                        <CheckCircle2 size={12} />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50">
                        <XCircle size={12} />
                        Suspendu
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      trigger={
                        <button className="p-2 text-gray-500 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      }
                      align="right"
                    >
                      <DropdownItem onClick={() => { setEditingProducer({ ...producer, firstName: producer.first_name || producer.firstName || "", lastName: producer.last_name || producer.lastName || "", area: producer.area_ha || producer.area || 0 }); }}>Modifier</DropdownItem>
                      <DropdownItem onClick={() => handleToggleStatus(producer)}>Changer Statut</DropdownItem>
                      <DropdownItem
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteProducer(producer)}
                      >Supprimer</DropdownItem>
                    </Dropdown>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Aucun producteur ne correspond à votre recherche/filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vue Mobile (Cartes) */}
        <div className="md:hidden flex flex-col gap-4 min-h-[400px]">
          {currentProducers.length > 0 ? currentProducers.map((producer, i) => (
             <div 
               key={i} 
               className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative flex flex-col gap-3 cursor-pointer group"
               onClick={() => setEditingProducer({ ...producer, firstName: producer.first_name || producer.firstName || "", lastName: producer.last_name || producer.lastName || "", area: producer.area_ha || producer.area || 0 })}
             >
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold text-sm uppercase flex-shrink-0 group-hover:scale-105 transition-transform">
                     {(producer.firstName || producer.first_name)[0]}{(producer.lastName || producer.last_name)[0]}
                   </div>
                   <div>
                     <div className="text-sm font-bold text-gray-900 dark:text-white">{(producer.firstName || producer.first_name)} {(producer.lastName || producer.last_name)}</div>
                     <div className="text-xs text-gray-500 font-medium dark:text-gray-400">{producer.code || producer.id}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                   {producer.status === "Actif" ? (
                     <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-leaf-light/20 text-leaf-dark border border-leaf-light/30">
                       Actif
                     </span>
                   ) : (
                     <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50">
                       Suspendu
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
                     <DropdownItem onClick={() => { setEditingProducer({ ...producer, firstName: producer.first_name || producer.firstName || "", lastName: producer.last_name || producer.lastName || "", area: producer.area_ha || producer.area || 0 }); }}>Modifier</DropdownItem>
                     <DropdownItem onClick={() => handleToggleStatus(producer)}>Changer Statut</DropdownItem>
                     <DropdownItem
                       className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                       onClick={() => handleDeleteProducer(producer)}
                     >Supprimer</DropdownItem>
                   </Dropdown>
                 </div>
               </div>
               
               {/* Separator Dashed */}
               <div className="border-b border-dashed border-gray-100 dark:border-gray-700/60 my-1"></div>

               <div className="flex flex-col gap-3 text-sm">
                 <div className="flex justify-between items-start gap-4">
                   <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Localisation:</span>
                   <div className="flex items-start gap-1 text-right justify-end">
                     <MapPin size={14} className="text-earth-light flex-shrink-0 mt-0.5" />
                     <div>
                       <span className="font-semibold text-gray-900 dark:text-white text-xs block">{producer.village}</span>
                       <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{producer.cooperative}</span>
                     </div>
                   </div>
                 </div>

                 <div className="flex justify-between items-center">
                   <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                   <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                     <Phone size={14} className="text-gray-400" />
                     {producer.phone}
                   </span>
                 </div>

                 <div className="flex justify-between items-center">
                   <span className="text-gray-500 dark:text-gray-400">Surface Totale:</span>
                   <span className="font-bold text-gray-900 dark:text-white">
                     {(producer.area || producer.area_ha).toFixed(1)} ha
                   </span>
                 </div>
               </div>
             </div>
          )) : (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center">
              Aucun producteur ne correspond à votre recherche/filtre.
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} sur {filtered.length} producteurs</span>
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
                    "px-3 py-1 rounded transition-colors hidden sm:block",
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

      {/* Modale d'ajout */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Producteur">
        <form className="space-y-4" onSubmit={handleAddProducer}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Prénom</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: Jean" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nom</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: Dupont" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Téléphone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="+226 XX XX XX XX" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Surface Initiale (ha)</label>
              <input type="number" step="0.1" name="area" value={formData.area} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: 2.5" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Village</label>
            <input type="text" name="village" value={formData.village} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: Koudougou" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Coopérative</label>
            <input type="text" name="cooperative" value={formData.cooperative} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Nom de la coopérative (optionnel)" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Enregistrer</button>
          </div>
        </form>
      </Modal>

      {/* Modal Edition */}
      <Modal isOpen={!!editingProducer} onClose={() => setEditingProducer(null)} title="Modifier le Producteur">
        {editingProducer && (
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-[10px] text-gray-500 dark:text-gray-400 font-mono break-all">
              <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-0.5">Identifiants</span>
              Code : <span className="font-bold text-gray-800 dark:text-gray-200">{editingProducer.code || "Nouveau"}</span><br />
              ID technique (UUID) : {editingProducer.id}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
                <input type="text" value={editingProducer.firstName} onChange={e => setEditingProducer({...editingProducer, firstName: e.target.value})} required className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                <input type="text" value={editingProducer.lastName} onChange={e => setEditingProducer({...editingProducer, lastName: e.target.value})} required className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Village/Zone</label>
                <input type="text" value={editingProducer.village} onChange={e => setEditingProducer({...editingProducer, village: e.target.value})} required className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Surface (ha)</label>
                <input type="number" step="0.1" value={editingProducer.area} onChange={e => setEditingProducer({...editingProducer, area: parseFloat(e.target.value) || 0})} required className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                <input type="tel" value={editingProducer.phone} onChange={e => setEditingProducer({...editingProducer, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Coopérative</label>
                <input type="text" value={editingProducer.cooperative} onChange={e => setEditingProducer({...editingProducer, cooperative: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingProducer(null)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Enregistrer</button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
}