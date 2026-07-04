"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/toaster";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";

import { 
  Users,
  Map,
  Package,
  ShoppingCart,
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  Edit2,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  Printer,
  MoreHorizontal
} from "lucide-react";
import { cn, exportToCSV } from "@/lib/utils";

// Les métriques sont chargées dynamiquement depuis Supabase

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Remboursé": "bg-green-100 text-green-700 border-green-200",
    "Partiel": "bg-orange-100 text-orange-700 border-orange-200",
    "En attente": "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <span className={cn(
      "px-3 py-1 text-xs font-medium rounded-full border",
      styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
    )}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const supabase = createClient();

  // Real-time stats from Supabase
  const [nbProducers, setNbProducers] = useState<number | null>(null);
  const [totalArea, setTotalArea] = useState<number | null>(null);
  const [totalHarvest, setTotalHarvest] = useState<number | null>(null);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState("Saison des pluies");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [viewingDist, setViewingDist] = useState<any>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchStats = async () => {
      // Count producers
      const { count: pCount } = await supabase.from('producers').select('*', { count: 'exact', head: true });
      setNbProducers(pCount ?? 0);

      // Sum of parcel areas
      const { data: parcels } = await supabase.from('parcels').select('area_ha');
      const area = parcels?.reduce((acc, p) => acc + (p.area_ha || 0), 0) ?? 0;
      setTotalArea(area);

      // Sum of harvest weights
      const { data: harvests } = await supabase.from('harvests').select('quantity_kg');
      const harvest = harvests?.reduce((acc, h) => acc + (h.quantity_kg || 0), 0) ?? 0;
      setTotalHarvest(harvest);

      // Latest distributions — use server-side route to bypass RLS with cookie session
      try {
        const res = await fetch('/api/inputs');
        if (res.ok) {
          const data = await res.json();
          setDistributions(data);
        }
      } catch (e) {
        console.error('Failed to fetch distributions:', e);
      }
    };
    fetchStats();
  }, []);

  const stats = useMemo(() => [
    {
      title: "Total Producteurs",
      value: nbProducers !== null ? nbProducers.toLocaleString('fr-FR') : "…",
      trend: "+0",
      trendUp: true,
      subtitle: "dans la base",
      icon: Users,
    },
    {
      title: "Surface Totale",
      value: totalArea !== null ? `${totalArea.toLocaleString('fr-FR')} ha` : "…",
      trend: "+0 ha",
      trendUp: true,
      subtitle: "toutes parcelles",
      icon: Map,
    },
    {
      title: "Avances Intrants",
      value: distributions.length > 0 ? `${distributions.length} distribution${distributions.length > 1 ? 's' : ''}` : "0 distribution",
      trend: "+0%",
      trendUp: true,
      subtitle: "distributions enregistrées",
      icon: Package,
    },
    {
      title: "Collecte Réelle",
      value: totalHarvest !== null ? `${(totalHarvest / 1000).toFixed(1)} T` : "…",
      trend: "+0%",
      trendUp: totalHarvest !== null && totalHarvest > 0,
      subtitle: "récoltes pesées",
      icon: ShoppingCart,
    }
  ], [nbProducers, totalArea, totalHarvest, distributions]);

  const filteredDist = distributions.filter(d => filterStatus === "Tous" || d.status === filterStatus);
  const totalPages = Math.ceil(filteredDist.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDist = filteredDist.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
            <span className="text-sm text-gray-500 font-medium leading-none">Campagne Agricole 2026-2027</span>
            <div className="flex items-center">
              <Dropdown
                trigger={
                  <button 
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors h-7 -mt-0.5"
                  >
                    <Calendar size={14} className="text-gray-500" />
                    <span className="font-medium leading-none">{selectedCampaign}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                }
              >
                <DropdownItem onClick={() => setSelectedCampaign("Saison des pluies")}>Saison des pluies</DropdownItem>
                <DropdownItem onClick={() => setSelectedCampaign("Saison sèche")}>Saison sèche</DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            onClick={() => {
              exportToCSV("Distributions_OpeAgri", filteredDist, {
                id: "ID",
                producer: "Producteur",
                village: "Village",
                items: "Intrants",
                amount: "Montant Avance",
                date: "Date",
                status: "Statut"
              });
              toast("Export CSV lancé avec succès.");
            }}
          >
            <Download size={16} />
            Rapport
          </button>
        </div>
      </div>
 
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon size={18} className="text-primary" />
                </div>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-lg sm:text-2xl font-bold text-gray-900 break-words whitespace-normal leading-tight w-full">
                  {stat.value}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  "flex items-center text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                  stat.trendUp ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                )}>
                  {stat.trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                  {stat.trend}
                </span>
                <span className="text-xs text-gray-400 truncate">{stat.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="md:bg-white md:dark:bg-gray-800 md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:dark:border-gray-700 md:overflow-hidden bg-transparent border-none shadow-none overflow-visible">
        <div className="p-6 md:border-b border-gray-100 dark:border-gray-700 bg-white md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent rounded-2xl md:rounded-none border border-gray-100 dark:border-gray-700 md:border-none shadow-sm md:shadow-none mb-4 md:mb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Dernières Distributions d'Intrants</h2>
          
          <Dropdown
            trigger={
              <button 
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} />
                {filterStatus === "Tous" ? "Filtres" : `Statut: ${filterStatus}`}
              </button>
            }
            align="right"
          >
            <DropdownItem onClick={() => { setFilterStatus("Tous"); setCurrentPage(1); }}>Tous</DropdownItem>
            <DropdownItem onClick={() => { setFilterStatus("Remboursé"); setCurrentPage(1); }}>Remboursé</DropdownItem>
            <DropdownItem onClick={() => { setFilterStatus("Partiel"); setCurrentPage(1); }}>Partiel</DropdownItem>
            <DropdownItem onClick={() => { setFilterStatus("En attente"); setCurrentPage(1); }}>En attente</DropdownItem>
          </Dropdown>
        </div>

        {/* Vue Desktop (Tableau) */}
        <div className="hidden md:block overflow-x-auto min-h-[300px]">
          {currentDist.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID Dist.</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producteur</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Intrants</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Montant Avance</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remboursement</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentDist.map((dist, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{dist.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      <div className="flex flex-col">
                        <span>{dist.producer}</span>
                        <span className="text-xs text-gray-400">{dist.village}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate" title={dist.items}>
                      {dist.items}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {dist.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {dist.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={dist.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-md transition-colors" 
                          title="Voir les détails"
                          onClick={() => setViewingDist(dist)}
                        >
                          <Eye size={16} />
                        </button>
                        <Dropdown
                          trigger={
                            <button 
                              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-md transition-colors" 
                              title="Modifier"
                            >
                              <Edit2 size={16} />
                            </button>
                          }
                          align="right"
                        >
                          <DropdownItem onClick={() => {
                            setDistributions(prev => prev.map(d => d.id === dist.id ? { ...d, status: "Remboursé" } : d));
                            toast("Marqué comme remboursé.");
                          }}>Marquer remboursé</DropdownItem>
                          <DropdownItem onClick={() => {
                            setDistributions(prev => prev.map(d => d.id === dist.id ? { ...d, status: "Partiel" } : d));
                            toast("Marqué comme remboursement partiel.");
                          }}>Marquer partiel</DropdownItem>
                          <DropdownItem 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setDistributions(prev => prev.filter(d => d.id !== dist.id));
                              toast("Distribution supprimée.");
                            }}
                          >Supprimer</DropdownItem>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">Aucune distribution trouvée</p>
              <p className="text-sm mt-1">Essayez de modifier vos filtres.</p>
            </div>
          )}
        </div>

        {/* Vue Mobile (Cartes) */}
        <div className="md:hidden flex flex-col gap-4 min-h-[300px]">
          {currentDist.length > 0 ? (
            currentDist.map((dist, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      <Package size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{dist.producer}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">#{dist.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={dist.status} />
                    <div className="flex items-center gap-0.5">
                      <button 
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-md transition-colors" 
                        title="Voir les détails"
                        onClick={() => setViewingDist(dist)}
                      >
                        <Eye size={16} />
                      </button>
                      <Dropdown
                        trigger={
                          <button 
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-md transition-colors"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        }
                        align="right"
                      >
                        <DropdownItem onClick={() => {
                          setDistributions(prev => prev.map(d => d.id === dist.id ? { ...d, status: "Remboursé" } : d));
                          toast("Marqué comme remboursé.");
                        }}>Marquer remboursé</DropdownItem>
                        <DropdownItem onClick={() => {
                          setDistributions(prev => prev.map(d => d.id === dist.id ? { ...d, status: "Partiel" } : d));
                          toast("Marqué comme remboursement partiel.");
                        }}>Marquer partiel</DropdownItem>
                        <DropdownItem 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDistributions(prev => prev.filter(d => d.id !== dist.id));
                            toast("Distribution supprimée.");
                          }}
                        >Supprimer</DropdownItem>
                      </Dropdown>
                    </div>
                  </div>
                </div>
                
                {/* Separator Dashed */}
                <div className="border-b border-dashed border-gray-100 dark:border-gray-700/60 my-1"></div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Intrants:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[200px] truncate" title={dist.items}>{dist.items}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Montant Avance:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{dist.amount}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Localisation:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-xs">{dist.village}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">{dist.date}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center">
              Aucune distribution trouvée.
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDist.length)} sur {filteredDist.length} résultats</span>
            <div className="flex items-center gap-1">
              <button 
                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors" 
                disabled={currentPage === 1} 
                onClick={handlePrevPage}
              >
                &lt;
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button 
                  key={idx}
                  className={cn(
                    "px-3 py-1 rounded transition-colors",
                    currentPage === idx + 1 ? "bg-primary text-white" : "border border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}

              <button 
                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors" 
                disabled={currentPage === totalPages} 
                onClick={handleNextPage}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Reçu de Distribution */}
      <Modal isOpen={!!viewingDist} onClose={() => setViewingDist(null)} title="Reçu de Distribution">
        {viewingDist && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Reçu #{viewingDist.id}</h3>
                <p className="text-sm text-gray-500">{viewingDist.date}</p>
              </div>
              <StatusBadge status={viewingDist.status} />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bénéficiaire</p>
              <p className="font-medium text-gray-900">{viewingDist.producer}</p>
              <p className="text-sm text-gray-500">{viewingDist.village}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Détails des Intrants</p>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{viewingDist.items}</p>
              </div>
            </div>

            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/10">
              <span className="font-semibold text-gray-700">Montant Total de l'Avance</span>
              <span className="text-lg font-bold text-primary">{viewingDist.amount}</span>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button onClick={() => setViewingDist(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Fermer</button>
              <button onClick={() => { window.print(); setViewingDist(null); }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
                <Printer size={16} /> Imprimer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}