import { useQuery } from '@tanstack/react-query';
import { useStockStore } from '@/lib/store';

export function useCustomData() {
  const { customDataSources, setCustomDataValue, refreshInterval } = useStockStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customData', customDataSources],
    queryFn: async () => {
      const results = await Promise.all(
        customDataSources.map(async (source) => {
          try {
            const response = await fetch(source.url);
            const data = await response.json();
            
            // Extract value using path (supports dot notation)
            const pathParts = source.path.split('.');
            let value = data;
            for (const part of pathParts) {
              value = value[part];
              if (value === undefined) break;
            }
            
            // Extract previous value if path is provided (for percentage calculation)
            let changePercent: number | undefined;
            if (source.previousPath && typeof value === 'number') {
              const prevPathParts = source.previousPath.split('.');
              let previousValue = data;
              for (const part of prevPathParts) {
                previousValue = previousValue[part];
                if (previousValue === undefined) break;
              }
              
              if (typeof previousValue === 'number' && previousValue !== 0) {
                changePercent = ((value - previousValue) / previousValue) * 100;
              }
            }
            
            return {
              name: source.name,
              value: value ?? 0,
              decimals: source.decimals,
              changePercent,
              error: null,
            };
          } catch (error) {
            console.error(`Error fetching ${source.name}:`, error);
            return {
              name: source.name,
              value: 0,
              decimals: source.decimals,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );
      
      // Update store with fetched values
      results.forEach((result) => {
        setCustomDataValue(result.name, {
          value: result.value,
          decimals: result.decimals,
          changePercent: result.changePercent,
        });
      });
      
      return results;
    },
    refetchInterval: refreshInterval * 1000, // Convert to milliseconds
    enabled: customDataSources.length > 0,
  });

  return {
    customData: data || [],
    isLoading,
    isError,
    refetch,
  };
}