import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStockStore } from '@/lib/store';
import { fetchStocks, fetchCustomData } from '@/lib/api';
import type { Stock } from '@/types';

export function useStocks() {
  const {
    stockSymbols,
    customDataSources,
    refreshInterval,
    setStocks,
    setCustomDataValue,
  } = useStockStore();
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAllData = useCallback(async () => {
    const promises: Promise<any>[] = [];
    
    // Fetch stock data
    if (stockSymbols.length > 0) {
      promises.push(
        fetchStocks(stockSymbols)
          .then((stocks) => {
            setStocks(stocks);
            return stocks;
          })
          .catch((error) => {
            console.error('Error fetching stocks:', error);
            // Return empty array on error but don't throw
            return [];
          })
      );
    }
    
    // Fetch custom API data
    customDataSources.forEach((source) => {
      promises.push(
        fetchCustomData(source)
          .then((value) => {
            setCustomDataValue(source.name, value);
            return value;
          })
          .catch((error) => {
            console.error(`Error fetching ${source.name}:`, error);
            setCustomDataValue(source.name, {
              value: 'Error',
              decimals: 0,
            });
            return null;
          })
      );
    });
    
    const results = await Promise.all(promises);
    setLastUpdated(new Date());
    return results; // Return the results to satisfy React Query
  }, [stockSymbols, customDataSources, setStocks, setCustomDataValue]);

  const { data: stocks = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['stocks', stockSymbols, customDataSources],
    queryFn: fetchAllData,
    refetchInterval: refreshInterval * 1000,
    staleTime: (refreshInterval - 5) * 1000,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    stocks: useStockStore.getState().currentStocks,
    isLoading,
    isError,
    error,
    refetch,
    lastUpdated,
  };
}