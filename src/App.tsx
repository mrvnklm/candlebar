import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { listen } from '@tauri-apps/api/event';
import { Header } from '@/components/layout/Header';
import { BottomBar } from '@/components/layout/BottomBar';
import { StockList } from '@/components/stocks/StockList';
import { CustomDataList } from '@/components/custom/CustomDataList';
import { ManageModal } from '@/components/modals/ManageModal';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useStocks } from '@/hooks/useStocks';
import { useCustomData } from '@/hooks/useCustomData';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useStockStore } from '@/lib/store';
import { updateTrayTitle } from '@/lib/api';
import { ROTATION_INTERVAL } from '@/lib/constants';

const queryClient = new QueryClient();

function AppContent() {
  const [manageOpen, setManageOpen] = useState(false);
  const { stocks, isLoading: stocksLoading, isError, refetch: refetchStocks, lastUpdated } = useStocks();
  const { customData, isLoading: customDataLoading, refetch: refetchCustomData } = useCustomData();
  const { displayMode, currentIndex, incrementIndex, symbolAliases, customDataSources } = useStockStore();
  const { toast } = useToast();

  // Update tray title
  useEffect(() => {
    if (stocks.length === 0 && customDataSources.length === 0) {
      updateTrayTitle('No data');
      return;
    }

    let title = '';
    
    if (displayMode === 'all') {
      // Show all stocks and custom data in one line
      const stockTitles = stocks.map(stock => {
        const displayName = symbolAliases[stock.symbol] || stock.symbol;
        const percent = stock.changePercent || stock.change_percent || 0;
        const sign = percent >= 0 ? '' : '-';
        return `${displayName} ${sign}${Math.abs(percent).toFixed(1)}%`;
      });
      
      // Add custom data values
      const customTitles = customData.map(data => {
        if (data.error) return '';
        const source = customDataSources.find(s => s.name === data.name);
        if (!source) return '';
        
        const displayName = source.alias || data.name;
        const value = typeof data.value === 'number' 
          ? data.value.toFixed(data.decimals)
          : data.value;
        return `${displayName} ${value}`;
      }).filter(Boolean);
      
      title = [...stockTitles, ...customTitles].join(' ');
    } else {
      // Cycle through stocks and custom data
      const totalItems = stocks.length + customData.length;
      if (totalItems === 0) {
        updateTrayTitle('No data');
        return;
      }
      
      const itemIndex = currentIndex % totalItems;
      
      if (itemIndex < stocks.length) {
        // Show stock
        const stock = stocks[itemIndex];
        const displayName = symbolAliases[stock.symbol] || stock.symbol;
        const percent = stock.changePercent || stock.change_percent || 0;
        const sign = percent >= 0 ? '' : '-';
        title = `${displayName} $${stock.price.toFixed(2)} ${sign}${Math.abs(percent).toFixed(1)}%`;
      } else {
        // Show custom data
        const customIndex = itemIndex - stocks.length;
        const data = customData[customIndex];
        if (data && !data.error) {
          const source = customDataSources.find(s => s.name === data.name);
          if (source) {
            const displayName = source.alias || data.name;
            const value = typeof data.value === 'number' 
              ? data.value.toFixed(data.decimals)
              : data.value;
            title = `${displayName} ${value}`;
          }
        }
      }
    }
    
    updateTrayTitle(title);
  }, [stocks, customData, customDataSources, displayMode, currentIndex, symbolAliases]);

  // Rotation timer for cycle mode
  useEffect(() => {
    const totalItems = stocks.length + customData.length;
    if (displayMode === 'cycle' && totalItems > 0) {
      const interval = setInterval(() => {
        incrementIndex();
      }, ROTATION_INTERVAL);
      
      return () => clearInterval(interval);
    }
  }, [displayMode, stocks.length, customData.length, incrementIndex]);

  // Listen for refresh event from system tray (commented out until permissions are configured)
  // useEffect(() => {
  //   const unlisten = listen('refresh-stocks', () => {
  //     refetchStocks();
  //     refetchCustomData();
  //     toast({
  //       title: "Refreshing",
  //       description: "Fetching latest data...",
  //     });
  //   });

  //   return () => {
  //     unlisten.then((fn) => fn());
  //   };
  // }, [refetchStocks, refetchCustomData, toast]);

  // Show error toast if there's an error
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error fetching data",
        description: "Failed to fetch stock data. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  const handleRefresh = () => {
    refetchStocks();
    refetchCustomData();
    toast({
      title: "Refreshing",
      description: "Fetching latest data...",
    });
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'r',
      ctrlKey: true,
      handler: handleRefresh,
    },
    {
      key: 's',
      ctrlKey: true,
      handler: () => setManageOpen(true),
    },
    {
      key: 'Escape',
      handler: () => setManageOpen(false),
    },
  ]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        onRefresh={handleRefresh}
        onOpenSettings={() => setManageOpen(true)}
        isRefreshing={stocksLoading || customDataLoading}
      />
      
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
        <StockList stocks={stocks} isLoading={stocksLoading} />
        {customDataSources.length > 0 && (
          <>
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">Custom Data</h2>
              <CustomDataList customData={customData} isLoading={customDataLoading} />
            </div>
          </>
        )}
      </div>
      
      <BottomBar lastUpdated={lastUpdated} />
      
      <ManageModal
        open={manageOpen}
        onOpenChange={setManageOpen}
      />
      
      <Toaster />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}