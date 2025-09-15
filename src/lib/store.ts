import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Stock, CustomDataSource, CustomDataValue, DisplayMode } from '@/types';

interface StockStore {
  // Stock data
  stockSymbols: string[];
  symbolAliases: Record<string, string>;
  currentStocks: Stock[];
  
  // Custom APIs
  customDataSources: CustomDataSource[];
  customDataValues: Record<string, CustomDataValue>;
  
  // Settings
  displayMode: DisplayMode;
  refreshInterval: number; // in seconds
  currentIndex: number;
  
  // Actions
  addStock: (symbol: string, alias?: string) => void;
  removeStock: (symbol: string) => void;
  updateAlias: (symbol: string, alias: string) => void;
  setStocks: (stocks: Stock[]) => void;
  reorderStocks: (symbols: string[]) => void;
  
  addCustomAPI: (source: CustomDataSource) => void;
  removeCustomAPI: (name: string) => void;
  setCustomDataValue: (name: string, value: CustomDataValue) => void;
  
  setDisplayMode: (mode: DisplayMode) => void;
  setRefreshInterval: (interval: number) => void;
  incrementIndex: () => void;
  
  importConfig: (config: any) => void;
  exportConfig: () => any;
}

const defaultStockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];

export const useStockStore = create<StockStore>()(
  persist(
    (set, get) => ({
      // Initial state
      stockSymbols: defaultStockSymbols,
      symbolAliases: {},
      currentStocks: [],
      customDataSources: [],
      customDataValues: {},
      displayMode: 'all',
      refreshInterval: 30,
      currentIndex: 0,
      
      // Stock actions
      addStock: (symbol: string, alias?: string) => {
        set((state) => {
          const upperSymbol = symbol.toUpperCase().trim();
          if (state.stockSymbols.includes(upperSymbol)) {
            return state;
          }
          
          const newAliases = alias?.trim() 
            ? { ...state.symbolAliases, [upperSymbol]: alias.trim() }
            : state.symbolAliases;
          
          return {
            stockSymbols: [...state.stockSymbols, upperSymbol],
            symbolAliases: newAliases,
          };
        });
      },
      
      removeStock: (symbol: string) => {
        set((state) => {
          const newAliases = { ...state.symbolAliases };
          delete newAliases[symbol];
          
          return {
            stockSymbols: state.stockSymbols.filter(s => s !== symbol),
            symbolAliases: newAliases,
            currentStocks: state.currentStocks.filter(s => s.symbol !== symbol),
          };
        });
      },
      
      updateAlias: (symbol: string, alias: string) => {
        set((state) => {
          if (alias.trim()) {
            return {
              symbolAliases: { ...state.symbolAliases, [symbol]: alias.trim() },
            };
          } else {
            const newAliases = { ...state.symbolAliases };
            delete newAliases[symbol];
            return { symbolAliases: newAliases };
          }
        });
      },
      
      setStocks: (stocks: Stock[]) => {
        set({ currentStocks: stocks });
      },
      
      reorderStocks: (symbols: string[]) => {
        set({ stockSymbols: symbols });
      },
      
      // Custom API actions
      addCustomAPI: (source: CustomDataSource) => {
        set((state) => ({
          customDataSources: [...state.customDataSources, source],
        }));
      },
      
      removeCustomAPI: (name: string) => {
        set((state) => {
          const newValues = { ...state.customDataValues };
          delete newValues[name];
          
          return {
            customDataSources: state.customDataSources.filter(s => s.name !== name),
            customDataValues: newValues,
          };
        });
      },
      
      setCustomDataValue: (name: string, value: CustomDataValue) => {
        set((state) => ({
          customDataValues: { ...state.customDataValues, [name]: value },
        }));
      },
      
      // Settings actions
      setDisplayMode: (mode: DisplayMode) => {
        set({ displayMode: mode });
      },
      
      setRefreshInterval: (interval: number) => {
        set({ refreshInterval: interval });
      },
      
      incrementIndex: () => {
        set((state) => ({
          currentIndex: (state.currentIndex + 1) % Math.max(1, state.currentStocks.length),
        }));
      },
      
      // Import/Export
      importConfig: (config: any) => {
        set({
          stockSymbols: config.symbols || defaultStockSymbols,
          symbolAliases: config.aliases || {},
          customDataSources: config.customData || [],
          displayMode: config.displayMode || 'all',
          refreshInterval: config.refreshInterval || 30,
        });
      },
      
      exportConfig: () => {
        const state = get();
        return {
          symbols: state.stockSymbols,
          aliases: state.symbolAliases,
          customData: state.customDataSources,
          displayMode: state.displayMode,
          refreshInterval: state.refreshInterval,
        };
      },
    }),
    {
      name: 'candlebar-storage',
      partialize: (state) => ({
        stockSymbols: state.stockSymbols,
        symbolAliases: state.symbolAliases,
        customDataSources: state.customDataSources,
        displayMode: state.displayMode,
        refreshInterval: state.refreshInterval,
      }),
    }
  )
);