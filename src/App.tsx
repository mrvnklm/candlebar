import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { listen } from '@tauri-apps/api/event';
import { Header } from '@/components/layout/Header';
import { BottomBar } from '@/components/layout/BottomBar';
import { StockList } from '@/components/stocks/StockList';
import { ManageModal } from '@/components/modals/ManageModal';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useStocks } from '@/hooks/useStocks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useStockStore } from '@/lib/store';
import { updateTrayTitle } from '@/lib/api';
import { ROTATION_INTERVAL } from '@/lib/constants';

const queryClient = new QueryClient();

function AppContent() {
  const [manageOpen, setManageOpen] = useState(false);
  const { stocks, isLoading, isError, refetch, lastUpdated } = useStocks();
  const { displayMode, currentIndex, incrementIndex, symbolAliases } = useStockStore();
  const { toast } = useToast();

  // Update tray title
  useEffect(() => {
    if (stocks.length === 0) {
      updateTrayTitle('No stocks');
      return;
    }

    let title = '';
    
    if (displayMode === 'all') {
      // Show all stocks in one line
      title = stocks.map(stock => {
        const displayName = symbolAliases[stock.symbol] || stock.symbol;
        const percent = stock.changePercent || stock.change_percent || 0;
        const sign = percent >= 0 ? '' : '-';
        return `${displayName} ${sign}${Math.abs(percent).toFixed(1)}%`;
      }).join(' ');
    } else {
      // Cycle through stocks
      const stock = stocks[currentIndex % stocks.length];
      if (stock) {
        const displayName = symbolAliases[stock.symbol] || stock.symbol;
        const percent = stock.changePercent || stock.change_percent || 0;
        const sign = percent >= 0 ? '' : '-';
        title = `${displayName} $${stock.price.toFixed(2)} ${sign}${Math.abs(percent).toFixed(1)}%`;
      }
    }
    
    updateTrayTitle(title);
  }, [stocks, displayMode, currentIndex, symbolAliases]);

  // Rotation timer for cycle mode
  useEffect(() => {
    if (displayMode === 'cycle' && stocks.length > 0) {
      const interval = setInterval(() => {
        incrementIndex();
      }, ROTATION_INTERVAL);
      
      return () => clearInterval(interval);
    }
  }, [displayMode, stocks.length, incrementIndex]);

  // Listen for refresh event from system tray (commented out until permissions are configured)
  // useEffect(() => {
  //   const unlisten = listen('refresh-stocks', () => {
  //     refetch();
  //     toast({
  //       title: "Refreshing stocks",
  //       description: "Fetching latest stock data...",
  //     });
  //   });

  //   return () => {
  //     unlisten.then((fn) => fn());
  //   };
  // }, [refetch, toast]);

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
    refetch();
    toast({
      title: "Refreshing",
      description: "Fetching latest stock data...",
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
        isRefreshing={isLoading}
      />
      
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <StockList stocks={stocks} isLoading={isLoading} />
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