/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, 
  Search, 
  ShoppingCart, 
  ChevronLeft, 
  Plus, 
  Minus, 
  Trash2, 
  LayoutGrid, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Terminal,
  Activity
} from "lucide-react";

// Types
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

type CartItem = Product & {
  quantity: number;
};

type Table = {
  id: number;
  status: "idle" | "occupied" | "awaiting";
  order: CartItem[];
};

// Data
const CATEGORIES = ["Hamburguesas", "Pizzas", "Bebidas frías"];

const PRODUCTS: Product[] = [
  { id: "h1", name: "Classic Burger", price: 12.0, category: "Hamburguesas" },
  { id: "h2", name: "Cheese Dragon Burger", price: 14.5, category: "Hamburguesas" },
  { id: "p1", name: "Margherita Pizza", price: 15.0, category: "Pizzas" },
  { id: "p2", name: "Hacker Pepperoni", price: 18.0, category: "Pizzas" },
  { id: "b1", name: "Limonada Natural", price: 4.0, category: "Bebidas frías" },
  { id: "b2", name: "Neon Soda", price: 3.5, category: "Bebidas frías" },
  { id: "b3", name: "Cyber Coffee", price: 5.0, category: "Bebidas frías" },
];

const INITIAL_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  status: Math.random() > 0.8 ? "occupied" : "idle",
  order: [],
}));

export default function App() {
  const [view, setView] = useState<"tables" | "menu" | "cart">("tables");
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [isGlitching, setIsGlitching] = useState(false); // Used for loading state now
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedTable = useMemo(() => 
    tables.find(t => t.id === selectedTableId), 
    [tables, selectedTableId]
  );

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = p.category === activeCategory;
      return matchesSearch && (searchQuery ? true : matchesCategory);
    });
  }, [searchQuery, activeCategory]);

  const cartTotal = useMemo(() => {
    if (!selectedTable) return 0;
    return selectedTable.order.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [selectedTable]);

  // Actions
  const handleSelectTable = (id: number) => {
    setSelectedTableId(id);
    setView("menu");
  };

  const handleAddToCart = (product: Product) => {
    if (selectedTableId === null) return;
    
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      const existing = t.order.find(item => item.id === product.id);
      if (existing) {
        return {
          ...t,
          status: "occupied",
          order: t.order.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        };
      }
      return {
        ...t,
        status: "occupied",
        order: [...t.order, { ...product, quantity: 1 }]
      };
    }));
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      return {
        ...t,
        order: t.order.map(item => {
          if (item.id === productId) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          return item;
        }).filter(item => item.quantity > 0)
      };
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      return {
        ...t,
        order: t.order.filter(item => item.id !== productId)
      };
    }));
  };

  const handleDispatch = () => {
    setIsGlitching(true);
    setTimeout(() => {
      setIsGlitching(false);
      setView("tables");
      setSelectedTableId(null);
    }, 1500);
  };

  const handleReleaseTable = () => {
    if (selectedTableId === null) return;
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      return {
        ...t,
        status: "idle",
        order: []
      };
    }));
    setView("tables");
    setSelectedTableId(null);
  };

  return (
    <div className="flex justify-center bg-slate-100 min-h-screen">
      <div className="w-full max-w-[430px] h-screen bg-slate-50 flex flex-col relative shadow-2xl border-x border-slate-200 overflow-hidden">
        {/* Sidebar - Tables (Current view on mobile) */}
        <aside className={`${view === "tables" ? "flex" : "hidden"} w-full bg-white flex-col shrink-0 overflow-hidden h-full`}>
          <div className="p-6 border-b border-slate-200 bg-white">
            <h1 className="text-xl font-bold tracking-tight text-indigo-600 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-6 h-6" />
                MesaPro
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{systemTime}</span>
            </h1>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-4 scrollbar-hide">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => handleSelectTable(table.id)}
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                  selectedTableId === table.id
                    ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : table.status === "occupied"
                      ? "bg-white border-amber-500 text-amber-500 shadow-sm"
                      : "bg-white border-slate-100 text-slate-300 hover:border-slate-200"
                }`}
              >
                <span className="text-2xl font-bold">{table.id}</span>
                <span className="text-[9px] uppercase font-bold tracking-wider mt-1">
                  {table.status === "occupied" ? "Ocupada" : "Libre"}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content - Products */}
        <main className={`${view === "menu" ? "flex" : "hidden"} flex-1 flex-col bg-slate-50 min-w-0 overflow-hidden h-full`}>
          {/* Top Bar */}
          <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setView("tables")}
              className="p-2 -ml-2 text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Escanear producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <button 
              onClick={() => setView("cart")}
              className="relative p-2 text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {selectedTable && selectedTable.order.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-indigo-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {selectedTable.order.length}
                </span>
              )}
            </button>
          </div>

          {/* Category Nav */}
          <nav className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 bg-white shadow-sm shadow-slate-200/50">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery("");
                }}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat && !searchQuery
                    ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 grid grid-cols-2 gap-3 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(product => (
                <motion.button
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleAddToCart(product)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 text-left transition-all active:scale-95 group"
                >
                  <div className="flex flex-col gap-1 h-full">
                    <span className="text-indigo-600 font-bold text-lg leading-none mb-1">${product.price.toFixed(2)}</span>
                    <span className="font-bold text-xs text-slate-800 leading-tight flex-1">{product.name}</span>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ADD</span>
                      <Plus className="w-3 h-3 text-indigo-500" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* Cart Panel - Detail */}
        <aside className={`${view === "cart" ? "flex" : "hidden"} flex-1 flex-col bg-white overflow-hidden h-full`}>
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-900">Detalle de Orden</h2>
              <span className="text-sm font-bold text-indigo-500">Mesa {selectedTableId}</span>
            </div>
            <button 
              onClick={() => setView("menu")}
              className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {selectedTable?.order.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Buffer vacío</p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedTable?.order.map(item => (
                    <motion.div 
                      layout
                      key={item.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-50"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-slate-800">{item.name}</span>
                        <span className="text-xs text-slate-400 font-bold tracking-tight">{item.quantity} x ${item.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-magenta-500 hover:bg-magenta-50 transition-all"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center text-slate-700">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="w-9 h-9 flex items-center justify-center text-slate-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] flex flex-col gap-4">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total a Pagar</span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">${cartTotal.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                disabled={isGlitching}
                onClick={handleReleaseTable}
                className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-400 font-bold rounded-2xl text-xs uppercase tracking-widest hover:border-amber-200 hover:text-amber-500 active:scale-95 transition-all outline-none"
              >
                Liberar Mesa
              </button>
              <button
                disabled={cartTotal === 0 || isGlitching}
                onClick={handleDispatch}
                className={`flex-[2] py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${
                  cartTotal > 0 && !isGlitching
                    ? "bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                }`}
              >
                {isGlitching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Enviar a Cocina
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navbar Overlay for Quick Totals */}
        {view === "menu" && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[382px] p-4 bg-slate-900 text-white rounded-[24px] shadow-2xl flex items-center justify-between z-40">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Total actual</span>
              <span className="text-xl font-black">${cartTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => setView("cart")}
              className="px-6 py-3 bg-indigo-500 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
            >
              Ver Orden
            </button>
          </div>
        )}

        {/* Success Overlay */}
        <AnimatePresence>
          {isGlitching && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-white/70 backdrop-blur-lg flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 text-center border-4 border-emerald-50"
              >
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">¡Éxito!</h3>
                  <p className="text-sm font-medium text-slate-400 mt-1 max-w-[200px]">Orden despachada y sincronizada</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}



