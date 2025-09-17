import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Stock, CustomDataSource, CustomDataValue, DisplayMode } from '@/types';

export type ValueDisplay = 'price' | 'percentage' | 'both';
export type EntrySpacing = 'compact' | 'normal' | 'relaxed';
export type SymbolDisplay = 'show' | 'hide' | 'symbol-only' | 'alias-only';

interface StockStore {
  // Stock data
  stockSymbols: string[];
  symbolAliases: Record<string, string>;
  currentStocks: Stock[];
  
  // Custom APIs
  customDataSources: CustomDataSource[];
  customDataValues: Record<string, CustomDataValue>;
  customPrefix: string; // Custom prefix for data sources that use custom prefix
  
  // Settings
  displayMode: DisplayMode;
  valueDisplay: ValueDisplay; // Global preference for showing price/percentage
  stockValueDisplays: Record<string, ValueDisplay>; // Individual stock preferences
  entrySpacing: EntrySpacing; // Spacing between entries
  symbolDisplay: SymbolDisplay; // How to display symbols/aliases
  globalDecimals: number; // Global decimal places
  stockDecimals: Record<string, number>; // Individual stock decimal settings
  refreshInterval: number; // in seconds
  currentIndex: number;
  autostart: boolean; // Auto-start at login
  
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
  setValueDisplay: (display: ValueDisplay) => void;
  setStockValueDisplay: (symbol: string, display: ValueDisplay | null) => void;
  setEntrySpacing: (spacing: EntrySpacing) => void;
  setSymbolDisplay: (display: SymbolDisplay) => void;
  setGlobalDecimals: (decimals: number) => void;
  setStockDecimals: (symbol: string, decimals: number | null) => void;
  setRefreshInterval: (interval: number) => void;
  setCustomPrefix: (prefix: string) => void;
  incrementIndex: () => void;
  setAutostart: (enabled: boolean) => void;
  
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
      customPrefix: '',
      displayMode: 'all',
      valueDisplay: 'both',
      stockValueDisplays: {},
      entrySpacing: 'normal',
      symbolDisplay: 'show',
      globalDecimals: 2,
      stockDecimals: {},
      refreshInterval: 30,
      currentIndex: 0,
      autostart: false,
      
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
          
          const newStockValueDisplays = { ...state.stockValueDisplays };
          delete newStockValueDisplays[symbol];
          
          const newStockDecimals = { ...state.stockDecimals };
          delete newStockDecimals[symbol];
          
          return {
            stockSymbols: state.stockSymbols.filter(s => s !== symbol),
            symbolAliases: newAliases,
            stockValueDisplays: newStockValueDisplays,
            stockDecimals: newStockDecimals,
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
      
      setValueDisplay: (display: ValueDisplay) => {
        set({ valueDisplay: display });
      },
      
      setStockValueDisplay: (symbol: string, display: ValueDisplay | null) => {
        set((state) => {
          if (display === null) {
            const newDisplays = { ...state.stockValueDisplays };
            delete newDisplays[symbol];
            return { stockValueDisplays: newDisplays };
          }
          return {
            stockValueDisplays: { ...state.stockValueDisplays, [symbol]: display }
          };
        });
      },
      
      setEntrySpacing: (spacing: EntrySpacing) => {
        set({ entrySpacing: spacing });
      },
      
      setSymbolDisplay: (display: SymbolDisplay) => {
        set({ symbolDisplay: display });
      },
      
      setGlobalDecimals: (decimals: number) => {
        set({ globalDecimals: decimals });
      },
      
      setStockDecimals: (symbol: string, decimals: number | null) => {
        set((state) => {
          if (decimals === null) {
            const newDecimals = { ...state.stockDecimals };
            delete newDecimals[symbol];
            return { stockDecimals: newDecimals };
          }
          return {
            stockDecimals: { ...state.stockDecimals, [symbol]: decimals }
          };
        });
      },
      
      setRefreshInterval: (interval: number) => {
        set({ refreshInterval: interval });
      },
      
      setCustomPrefix: (prefix: string) => {
        set({ customPrefix: prefix });
      },
      
      incrementIndex: () => {
        set((state) => ({
          currentIndex: state.currentIndex + 1,
        }));
      },
      
      setAutostart: (enabled: boolean) => {
        set({ autostart: enabled });
      },
      
      // Import/Export
      importConfig: (config: any) => {
        set({
          stockSymbols: config.symbols || defaultStockSymbols,
          symbolAliases: config.aliases || {},
          customDataSources: config.customData || [],
          customPrefix: config.customPrefix || '',
          displayMode: config.displayMode || 'all',
          valueDisplay: config.valueDisplay || 'both',
          stockValueDisplays: config.stockValueDisplays || {},
          entrySpacing: config.entrySpacing || 'normal',
          symbolDisplay: config.symbolDisplay || 'show',
          globalDecimals: config.globalDecimals ?? 2,
          stockDecimals: config.stockDecimals || {},
          refreshInterval: config.refreshInterval || 30,
          autostart: config.autostart ?? false,
        });
      },
      
      exportConfig: () => {
        const state = get();
        return {
          symbols: state.stockSymbols,
          aliases: state.symbolAliases,
          customData: state.customDataSources,
          customPrefix: state.customPrefix,
          displayMode: state.displayMode,
          valueDisplay: state.valueDisplay,
          stockValueDisplays: state.stockValueDisplays,
          entrySpacing: state.entrySpacing,
          symbolDisplay: state.symbolDisplay,
          globalDecimals: state.globalDecimals,
          stockDecimals: state.stockDecimals,
          refreshInterval: state.refreshInterval,
          autostart: state.autostart,
        };
      },
    }),
    {
      name: 'candlebar-storage',
      partialize: (state) => ({
        stockSymbols: state.stockSymbols,
        symbolAliases: state.symbolAliases,
        customDataSources: state.customDataSources,
        customPrefix: state.customPrefix,
        displayMode: state.displayMode,
        valueDisplay: state.valueDisplay,
        stockValueDisplays: state.stockValueDisplays,
        entrySpacing: state.entrySpacing,
        symbolDisplay: state.symbolDisplay,
        globalDecimals: state.globalDecimals,
        stockDecimals: state.stockDecimals,
        refreshInterval: state.refreshInterval,
        autostart: state.autostart,
      }),
    }
  )
);