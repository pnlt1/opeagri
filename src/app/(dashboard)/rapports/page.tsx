"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/toaster";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import { exportToCSV, downloadSvgAsPng } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  Download,
  Calendar,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

type CampaignData = {
  collectes: { name: string, collecte: number }[],
  cultures: { name: string, value: number }[],
  avances: { name: string, avances: number, remboursements: number }[]
};

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

const campaignDataMap: Record<string, CampaignData> = {
  "Campagne Actuelle (2026-2027)": {
    collectes: [
      { name: 'Jan', collecte: 400 },
      { name: 'Fév', collecte: 300 },
      { name: 'Mar', collecte: 200 },
      { name: 'Avr', collecte: 278 },
      { name: 'Mai', collecte: 189 },
      { name: 'Juin', collecte: 239 },
      { name: 'Juil', collecte: 349 },
      { name: 'Août', collecte: 500 },
      { name: 'Sep', collecte: 700 },
      { name: 'Oct', collecte: 1200 },
      { name: 'Nov', collecte: 2100 },
      { name: 'Déc', collecte: 3000 },
    ],
    cultures: [
      { name: 'Coton', value: 45 },
      { name: 'Maïs', value: 25 },
      { name: 'Sésame', value: 20 },
      { name: 'Riz', value: 10 },
    ],
    avances: [
      { name: 'Ziniaré', avances: 4000, remboursements: 2400 },
      { name: 'Ouahigouya', avances: 3000, remboursements: 1398 },
      { name: 'Koudougou', avances: 2000, remboursements: 1800 },
      { name: 'Banfora', avances: 2780, remboursements: 2908 },
    ]
  },
  "Saison sèche (2025-2026)": {
    collectes: [
      { name: 'Jan', collecte: 600 },
      { name: 'Fév', collecte: 500 },
      { name: 'Mar', collecte: 300 },
      { name: 'Avr', collecte: 150 },
      { name: 'Mai', collecte: 100 },
      { name: 'Juin', collecte: 300 },
      { name: 'Juil', collecte: 400 },
      { name: 'Août', collecte: 450 },
      { name: 'Sep', collecte: 600 },
      { name: 'Oct', collecte: 800 },
      { name: 'Nov', collecte: 1500 },
      { name: 'Déc', collecte: 2200 },
    ],
    cultures: [
      { name: 'Coton', value: 15 },
      { name: 'Maïs', value: 35 },
      { name: 'Sésame', value: 40 },
      { name: 'Riz', value: 10 },
    ],
    avances: [
      { name: 'Ziniaré', avances: 3000, remboursements: 2800 },
      { name: 'Ouahigouya', avances: 2500, remboursements: 2000 },
      { name: 'Koudougou', avances: 1800, remboursements: 1600 },
      { name: 'Banfora', avances: 2000, remboursements: 1950 },
    ]
  },
  "Saison des pluies (2025)": {
    collectes: [
      { name: 'Jan', collecte: 100 },
      { name: 'Fév', collecte: 200 },
      { name: 'Mar', collecte: 150 },
      { name: 'Avr', collecte: 200 },
      { name: 'Mai', collecte: 400 },
      { name: 'Juin', collecte: 600 },
      { name: 'Juil', collecte: 1200 },
      { name: 'Août', collecte: 1800 },
      { name: 'Sep', collecte: 2100 },
      { name: 'Oct', collecte: 1500 },
      { name: 'Nov', collecte: 800 },
      { name: 'Déc', collecte: 500 },
    ],
    cultures: [
      { name: 'Coton', value: 55 },
      { name: 'Maïs', value: 20 },
      { name: 'Sésame', value: 15 },
      { name: 'Riz', value: 10 },
    ],
    avances: [
      { name: 'Ziniaré', avances: 5000, remboursements: 4500 },
      { name: 'Ouahigouya', avances: 4200, remboursements: 3800 },
      { name: 'Koudougou', avances: 3100, remboursements: 3000 },
      { name: 'Banfora', avances: 3500, remboursements: 3400 },
    ]
  }
};

interface DBCampaign {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
}

export default function RapportsPage() {
  const [campaigns, setCampaigns] = useState<DBCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentData, setCurrentData] = useState<CampaignData>({
    collectes: [],
    cultures: [],
    avances: []
  });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<{title: string, data: any[], type: string} | null>(null);
  
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [campaignToCompareId, setCampaignToCompareId] = useState("");

  // Load campaigns list
  useEffect(() => {
    async function loadCampaigns() {
      try {
        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .order("start_date", { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setCampaigns(data);
          // Default to active campaign or the most recent one
          const active = (data as DBCampaign[]).find((c: DBCampaign) => c.status === "En cours") || data[0];
          setSelectedCampaignId(active.id);
        } else {
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Error loading campaigns:", err);
        toast("Erreur lors du chargement des campagnes.", "error");
        setIsLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  // Fetch and aggregate data for selected campaign
  useEffect(() => {
    if (!selectedCampaignId) return;

    async function loadCampaignData() {
      setIsLoading(true);
      try {
        const campaign = campaigns.find(c => c.id === selectedCampaignId);
        if (!campaign) return;

        // 1. Fetch harvests in campaign's date range
        const { data: harvestsData, error: harvestsError } = await supabase
          .from("harvests")
          .select("id, quantity_kg, date, parcel:parcels(crop, village)")
          .gte("date", campaign.start_date)
          .lte("date", campaign.end_date);

        if (harvestsError) throw harvestsError;

        // 2. Fetch inputs in campaign's date range
        const { data: inputsData, error: inputsError } = await supabase
          .from("inputs")
          .select("id, amount, quantity, village, status, type, date")
          .gte("date", campaign.start_date + "T00:00:00Z")
          .lte("date", campaign.end_date + "T23:59:59Z");

        if (inputsError) throw inputsError;

        // --- Aggregations ---

        // A. Monthly collections
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const monthlyCollectes = monthNames.map(m => ({ name: m, collecte: 0 }));

        if (harvestsData) {
          harvestsData.forEach((h: any) => {
            if (!h.date) return;
            const date = new Date(h.date);
            const monthIdx = date.getMonth();
            if (monthIdx >= 0 && monthIdx < 12) {
              monthlyCollectes[monthIdx].collecte += (Number(h.quantity_kg) || 0) / 1000;
            }
          });
        }
        // Round to 2 decimals
        monthlyCollectes.forEach(m => {
          m.collecte = parseFloat(m.collecte.toFixed(2));
        });

        // B. Crops distribution
        const cropTotals: Record<string, number> = {};
        let totalHarvestedKg = 0;

        if (harvestsData) {
          harvestsData.forEach((h: any) => {
            const cropName = h.parcel?.crop || "Autre";
            const qty = Number(h.quantity_kg) || 0;
            cropTotals[cropName] = (cropTotals[cropName] || 0) + qty;
            totalHarvestedKg += qty;
          });
        }

        const cropBreakdown = Object.entries(cropTotals).map(([name, qty]) => {
          const percentage = totalHarvestedKg > 0 ? Math.round((qty / totalHarvestedKg) * 100) : 0;
          return { name, value: percentage };
        });

        // C. Advances vs Repayments by village
        const villageStats: Record<string, { avances: number, remboursements: number }> = {};

        if (inputsData) {
          inputsData.forEach((inp: any) => {
            const vil = inp.village || "Autre";
            if (!villageStats[vil]) {
              villageStats[vil] = { avances: 0, remboursements: 0 };
            }
            const amount = Number(inp.amount) || 0;
            if (inp.type === "Distribution") {
              villageStats[vil].avances += amount;
              if (inp.status === "Remboursé") {
                villageStats[vil].remboursements += amount;
              } else if (inp.status === "Partiel") {
                villageStats[vil].remboursements += amount * 0.5;
              }
            } else if (inp.type === "Remboursement") {
              villageStats[vil].remboursements += amount;
            }
          });
        }

        const statsByVillage = Object.entries(villageStats).map(([name, stats]) => ({
          name,
          avances: Math.round(stats.avances / 1000), // convert to kFCFA
          remboursements: Math.round(stats.remboursements / 1000)
        }));

        setCurrentData({
          collectes: monthlyCollectes,
          cultures: cropBreakdown,
          avances: statsByVillage
        });

      } catch (err: any) {
        console.error("Error aggregating reports data:", err);
        toast("Erreur lors de la préparation des graphiques.", "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadCampaignData();
  }, [selectedCampaignId, campaigns]);

  const selectedCampaignObj = campaigns.find(c => c.id === selectedCampaignId);
  const selectedCampaignName = selectedCampaignObj ? selectedCampaignObj.name : "Chargement...";

  const handleExport = () => {
    if (currentData.avances.length === 0) {
      toast("Aucune donnée disponible pour l'export.");
      return;
    }
    exportToCSV(`Rapports_OpeAgri_${selectedCampaignName}`, currentData.avances, {
      name: "Région/Village",
      avances: "Avances (kFCFA)",
      remboursements: "Remboursements (kFCFA)"
    });
    toast("Export CSV généré avec succès.");
  };

  const handleDownloadImage = async (chartId: string, filename: string) => {
    toast("Préparation de l'image en cours...");
    await downloadSvgAsPng(chartId, filename);
  };

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Analyses</h1>
          <p className="text-sm text-gray-500 mt-1">Visualisez les performances réelles de votre organisation.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            trigger={
              <button 
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Calendar size={16} className="text-gray-500" />
                <span className="font-medium">{selectedCampaignName}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
            }
          >
            {campaigns.map(c => (
              <DropdownItem key={c.id} onClick={() => setSelectedCampaignId(c.id)}>
                {c.name}
              </DropdownItem>
            ))}
            <div className="h-px bg-gray-100 my-1"></div>
            <DropdownItem onClick={() => setCompareModalOpen(true)}>Comparer deux campagnes</DropdownItem>
          </Dropdown>
          
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors"
            onClick={handleExport}
          >
            <Download size={16} />
            Exporter CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Évolution des Collectes (Tonnes)</h3>
              <Dropdown
                trigger={
                  <button className="p-2 text-gray-400 hover:text-gray-700 rounded-md transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                }
                align="right"
              >
                <DropdownItem onClick={() => { setDetailData({ title: "Évolution des Collectes", data: currentData.collectes, type: "collectes" }); setDetailModalOpen(true); }}>Voir en détail</DropdownItem>
                <DropdownItem onClick={() => handleDownloadImage("chart-collectes", "Evolution_Collectes")}>Télécharger l'image</DropdownItem>
              </Dropdown>
            </div>
            <div className="h-64 w-full" id="chart-collectes">
              {currentData.collectes.every(c => c.collecte === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  <LineChartIcon size={40} className="stroke-1 mb-2 text-gray-300" />
                  <p className="text-sm">Aucune collecte enregistrée pour cette campagne</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentData.collectes} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="collecte" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Répartition des Cultures (%)</h3>
              <Dropdown
                trigger={
                  <button className="p-2 text-gray-400 hover:text-gray-700 rounded-md transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                }
                align="right"
              >
                <DropdownItem onClick={() => { setDetailData({ title: "Répartition des Cultures", data: currentData.cultures, type: "cultures" }); setDetailModalOpen(true); }}>Voir en détail</DropdownItem>
                <DropdownItem onClick={() => handleDownloadImage("chart-cultures", "Repartition_Cultures")}>Télécharger l'image</DropdownItem>
              </Dropdown>
            </div>
            <div className="h-64 w-full" id="chart-cultures">
              {currentData.cultures.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  <PieChartIcon size={40} className="stroke-1 mb-2 text-gray-300" />
                  <p className="text-sm">Aucune récolte enregistrée pour cette campagne</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData.cultures}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {currentData.cultures.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#111827' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Comparatif Avances vs Remboursements par Village (kFCFA)</h3>
              <Dropdown
                trigger={
                  <button className="p-2 text-gray-400 hover:text-gray-700 rounded-md transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                }
                align="right"
              >
                <DropdownItem onClick={() => { setDetailData({ title: "Comparatif Avances vs Remboursements", data: currentData.avances, type: "avances" }); setDetailModalOpen(true); }}>Voir en détail</DropdownItem>
                <DropdownItem onClick={() => handleDownloadImage("chart-avances", "Avances_Remboursements")}>Télécharger l'image</DropdownItem>
              </Dropdown>
            </div>
            <div className="h-72 w-full" id="chart-avances">
              {currentData.avances.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  <BarChart3 size={40} className="stroke-1 mb-2 text-gray-300" />
                  <p className="text-sm">Aucune distribution d'intrants enregistrée pour cette campagne</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currentData.avances}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barSize={30}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="avances" name="Avances accordées" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="remboursements" name="Remboursements" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale Vue Détaillée */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Données : ${detailData?.title}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Données tabulaires pour la période sélectionnée.</p>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden max-h-96">
            
            {/* Vue Desktop (Tableau) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 sticky top-0">
                  <tr>
                    {detailData?.type === "collectes" && (
                      <>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mois</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Collecte (Tonnes)</th>
                      </>
                    )}
                    {detailData?.type === "cultures" && (
                      <>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Culture</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Répartition (%)</th>
                      </>
                    )}
                    {detailData?.type === "avances" && (
                      <>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Région/Village</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Avances (kFCFA)</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Remboursements (kFCFA)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {detailData?.data.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group text-gray-900 dark:text-white">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{row.name}</td>
                      {detailData?.type === "collectes" && <td className="px-6 py-4 whitespace-nowrap text-right">{row.collecte}</td>}
                      {detailData?.type === "cultures" && <td className="px-6 py-4 whitespace-nowrap text-right">{row.value}%</td>}
                      {detailData?.type === "avances" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{row.avances.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{row.remboursements.toLocaleString()}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vue Mobile (Cartes) */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {detailData?.data.map((row, i) => (
                <div key={i} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">{row.name}</span>
                    {detailData?.type === "cultures" && (
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {row.value}%
                      </span>
                    )}
                  </div>
                  {detailData?.type === "collectes" && (
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Collecte</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{row.collecte} Tonnes</span>
                    </div>
                  )}
                  {detailData?.type === "avances" && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 block">Avances</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{row.avances.toLocaleString()} kFCFA</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block">Remboursements</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{row.remboursements.toLocaleString()} kFCFA</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              onClick={() => setDetailModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                exportToCSV(`Export_${detailData?.title}`, detailData?.data || []);
                toast("Export CSV généré avec succès.");
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Download size={16} /> Exporter ces données
            </button>
          </div>
        </div>
      </Modal>

      {/* Modale Comparateur */}
      <Modal isOpen={compareModalOpen} onClose={() => setCompareModalOpen(false)} title="Comparer deux campagnes">
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Sélectionnez une deuxième campagne pour la comparer à <strong>{selectedCampaignName}</strong>.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campagne de référence</label>
            <div className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-600">
              {selectedCampaignName}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campagne à comparer</label>
            <select
              value={campaignToCompareId}
              onChange={(e) => setCampaignToCompareId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">-- Sélectionnez une campagne --</option>
              {campaigns.filter(c => c.id !== selectedCampaignId).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setCompareModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                if(!campaignToCompareId) {
                  toast("Veuillez sélectionner une campagne à comparer.");
                  return;
                }
                const compCampaign = campaigns.find(c => c.id === campaignToCompareId);
                toast(`Génération du rapport comparatif entre ${selectedCampaignName} et ${compCampaign?.name || ""}...`);
                setCompareModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700"
            >
              Générer le comparatif
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}