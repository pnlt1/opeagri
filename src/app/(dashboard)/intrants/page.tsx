"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/toaster";
import { Modal } from "@/components/ui/modal";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { distributionSchema, restockSchema, firstIssueMessage } from "@/lib/validations";

import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Package,
  Download,
  ChevronRight,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data pour les stocks d'intrants
const initialInventory = [
  {
    id: "INT-NPK",
    name: "Engrais NPK 15-15-15",
    category: "Engrais",
    quantity: 2450,
    unit: "Sacs (50kg)",
    status: "En stock",
    lastRestock: "12/05/2026",
  },
  {
    id: "INT-UREE",
    name: "Engrais Urée 46%",
    category: "Engrais",
    quantity: 1820,
    unit: "Sacs (50kg)",
    status: "En stock",
    lastRestock: "15/05/2026",
  },
  {
    id: "INT-SEM-MAIS",
    name: "Semences Maïs SR21",
    category: "Semences",
    quantity: 45,
    unit: "Sacs (10kg)",
    status: "Stock faible",
    lastRestock: "02/04/2026",
  },
  {
    id: "INT-PHYTO-1",
    name: "Herbicide Total",
    category: "Produits Phyto",
    quantity: 500,
    unit: "Bidons (1L)",
    status: "En stock",
    lastRestock: "20/05/2026",
  },
];

export default function IntrantsPage() {
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const fetchInventory = async () => {
    const { data, error } = await supabase.from('inventory').select('*').order('product', { ascending: true });
    if (data) {
      setInventoryList(data.map((item, idx) => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(item.id);
        const categoryLabel = item.type || "INT";
        const shortCat = categoryLabel.substring(0, 3).toUpperCase();
        const displayId = isUUID
          ? `INT-${shortCat}-${String(idx + 1).padStart(2, '0')}`
          : item.id;
        return {
          ...item,
          displayId,
          name: item.product,
          category: item.type,  // Le champ DB s'appelle "type", les filtres utilisent "category"
          lastRestock: item.last_restock ? new Date(item.last_restock).toLocaleDateString('fr-FR') : "N/A"
        };
      }));
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);
  const [isDistOpen, setIsDistOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  
  // Filtres
  const [categoryFilter, setCategoryFilter] = useState("Toutes");

  // Formularires
  const [distData, setDistData] = useState({ producer: "", product: "Engrais NPK 15-15-15", qty: "", amount: "" });
  const [stockData, setStockData] = useState({ product: "Engrais NPK 15-15-15", qty: "" });

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setDistData({ ...distData, [e.target.name]: e.target.value });
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setStockData({ ...stockData, [e.target.name]: e.target.value });
  };

  const handleDistribution = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = distributionSchema.safeParse({
      producer: distData.producer,
      product: distData.product,
      qty: parseInt(distData.qty) || 0,
      amount: distData.amount ? parseInt(distData.amount.replace(/\D/g, '')) || null : null,
    });
    if (!parsed.success) {
      toast(firstIssueMessage(parsed) ?? "Données invalides.");
      return;
    }
    const { producer, product, qty, amount } = parsed.data;

    const item = inventoryList.find(i => i.name === product);
    if (!item) return;

    const newQty = Math.max(0, item.quantity - qty);
    const newStatus = newQty < 50 ? "Stock faible" : "En stock";

    // 1. Update inventory
    const { error: invError } = await supabase.from('inventory').update({ quantity: newQty, status: newStatus }).eq('id', item.id);
    if (invError) {
      console.error("Supabase error (inventory update):", invError);
      toast("Une erreur est survenue lors de la mise à jour du stock.", "error");
      return;
    }

    // 2. Insert into inputs (distributions history)
    const { error: inputError } = await supabase.from('inputs').insert({
      producer: producer || "Producteur",
      product,
      quantity: qty,
      amount,
      date: new Date().toISOString(),
      type: "Distribution"
    });
    if (inputError) {
      console.error("Supabase error (input history):", inputError);
      toast("Une erreur est survenue lors de l'enregistrement de l'historique.", "error");
    }

    await fetchInventory();

    setIsDistOpen(false);
    toast(`Distribution de ${qty} ${product} enregistrée !`);
    setDistData({ producer: "", product: "Engrais NPK 15-15-15", qty: "", amount: "" });
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = restockSchema.safeParse({
      product: stockData.product,
      qty: parseInt(stockData.qty) || 0,
    });
    if (!parsed.success) {
      toast(firstIssueMessage(parsed) ?? "Données invalides.");
      return;
    }
    const { product, qty } = parsed.data;

    const item = inventoryList.find(i => i.name === product);
    if (!item) return;

    const newQty = item.quantity + qty;
    const newStatus = newQty < 50 ? "Stock faible" : "En stock";

    const { error } = await supabase.from('inventory').update({
      quantity: newQty,
      status: newStatus,
      last_restock: new Date().toISOString()
    }).eq('id', item.id);
    if (error) {
      console.error("Supabase error (restock):", error);
      toast("Une erreur est survenue. Veuillez réessayer.", "error");
      return;
    }

    await fetchInventory();

    setIsStockOpen(false);
    toast(`Réception de ${qty} ${stockData.product} ajoutée au stock !`);
    setStockData({ product: "Engrais NPK 15-15-15", qty: "" });
  };

  const filteredInventory = inventoryList.filter(p => {
    const matchesSearch = 
      (p.id || "").toLowerCase().includes(search.toLowerCase()) || 
      (p.name || "").toLowerCase().includes(search.toLowerCase()) || 
      (p.category || "").toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = categoryFilter === "Toutes" || p.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Intrants</h1>
          <p className="text-sm text-gray-500 mt-1">Suivez l'inventaire et les distributions d'engrais, semences et produits phytosanitaires.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setIsDistOpen(true)}
          >
            Nouvelle Distribution
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors"
            onClick={() => setIsStockOpen(true)}
          >
            <Plus size={16} />
            Réception Stock
          </button>
        </div>
      </div>

      {/* Cartes de résumé de stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Engrais</h3>
            <div className="p-2 bg-earth-50 rounded-lg">
              <Package size={18} className="text-earth-dark" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {inventoryList.filter(i => i.category === "Engrais").reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Semences</h3>
            <div className="p-2 bg-leaf-light/20 rounded-lg">
              <Package size={18} className="text-leaf-dark" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {inventoryList.filter(i => i.category === "Semences").reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Phyto</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package size={18} className="text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {inventoryList.filter(i => i.category === "Pesticides").reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Filtrer ce tableau..."
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
                {categoryFilter === "Toutes" ? "Filtres" : `Catégorie: ${categoryFilter}`}
              </button>
            }
          >
            <DropdownItem onClick={() => setCategoryFilter("Toutes")}>Toutes catégories</DropdownItem>
            <DropdownItem onClick={() => setCategoryFilter("Engrais")}>Catégorie: Engrais</DropdownItem>
            <DropdownItem onClick={() => setCategoryFilter("Semences")}>Catégorie: Semences</DropdownItem>
            <DropdownItem onClick={() => setCategoryFilter("Pesticides")}>Catégorie: Phyto</DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Tableau de l'inventaire */}
      <div className="md:bg-white md:dark:bg-gray-800 md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:dark:border-gray-700 md:overflow-hidden bg-transparent border-none shadow-none overflow-visible">
        <div className="p-6 md:border-b border-gray-100 dark:border-gray-700 bg-white md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent rounded-2xl md:rounded-none border border-gray-100 dark:border-gray-700 md:border-none shadow-sm md:shadow-none mb-4 md:mb-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">État du Stock</h2>
        </div>
        
        {/* Vue Desktop (Tableau) */}
        <div className="hidden md:block overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Quantité Disponible</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dernier approvisionnement</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">État</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredInventory.length > 0 ? filteredInventory.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.displayId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                    {item.quantity.toLocaleString()} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.lastRestock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.status === "En stock" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-leaf-light/20 text-leaf-dark border border-leaf-light/30">
                        En stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                        Stock faible
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Dropdown
                      trigger={
                        <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      }
                      align="right"
                    >
                      <DropdownItem onClick={() => { setDistData(prev => ({...prev, product: item.name})); setIsDistOpen(true); }}>Distribuer</DropdownItem>
                      <DropdownItem onClick={() => { setStockData(prev => ({...prev, product: item.name})); setIsStockOpen(true); }}>Commander</DropdownItem>
                    </Dropdown>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Aucun produit ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vue Mobile (Cartes de liste) */}
        <div className="md:hidden flex flex-col gap-4 min-h-[300px]">
          {filteredInventory.length > 0 ? filteredInventory.map((item, i) => (
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
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.displayId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {item.status === "En stock" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-leaf-light/20 text-leaf-dark border border-leaf-light/30">
                      En stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                      Stock faible
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
                    <DropdownItem onClick={() => { setDistData(prev => ({...prev, product: item.name})); setIsDistOpen(true); }}>Distribuer</DropdownItem>
                    <DropdownItem onClick={() => { setStockData(prev => ({...prev, product: item.name})); setIsStockOpen(true); }}>Commander</DropdownItem>
                  </Dropdown>
                </div>
              </div>
              
              {/* Separator Dashed */}
              <div className="border-b border-dashed border-gray-100 dark:border-gray-700/60 my-1"></div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Catégorie:</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right">{item.category}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Quantité Disponible:</span>
                  <span className="font-bold text-gray-900 dark:text-white text-right">
                    {item.quantity.toLocaleString()} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{item.unit}</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Dernier approvisionnement:</span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-xs text-right">{item.lastRestock}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center">
              Aucun produit ne correspond à votre recherche.
            </div>
          )}
        </div>
      </div>

      {/* Modale Distribution */}
      <Modal isOpen={isDistOpen} onClose={() => setIsDistOpen(false)} title="Nouvelle Distribution">
        <form className="space-y-4" onSubmit={handleDistribution}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Producteur</label>
            <select name="producer" value={distData.producer} onChange={handleDistChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="">Sélectionner un producteur...</option>
              <option value="Ali Ouedraogo">Ali Ouedraogo (PRD-2026-001)</option>
              <option value="Fati Sawadogo">Fati Sawadogo (PRD-2026-002)</option>
              <option value="Moussa Kaboré">Moussa Kaboré (PRD-2026-003)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Produit</label>
            <select name="product" value={distData.product} onChange={handleDistChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              {inventoryList.map(item => (
                <option key={item.id} value={item.name}>{item.name} ({item.quantity} restants)</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Quantité</label>
            <input type="number" name="qty" value={distData.qty} onChange={handleDistChange} required min="1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Ex: 5" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Montant avance (FCFA) <span className="text-gray-400 font-normal">— optionnel</span></label>
            <input type="number" name="amount" value={distData.amount} onChange={handleDistChange} min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Ex: 25000" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsDistOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Valider</button>
          </div>
        </form>
      </Modal>

      {/* Modale Réception Stock */}
      <Modal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} title="Réception de Stock">
        <form className="space-y-4" onSubmit={handleRestock}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Produit</label>
            <select name="product" value={stockData.product} onChange={handleStockChange} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              {inventoryList.map(item => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Quantité reçue</label>
            <input type="number" name="qty" value={stockData.qty} onChange={handleStockChange} required min="1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Ex: 100" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsStockOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Mettre à jour</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}