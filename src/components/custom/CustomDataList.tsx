import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useStockStore } from '@/lib/store';

interface CustomDataItem {
  name: string;
  value: number | string;
  decimals: number;
  changePercent?: number;
  error: string | null;
}

interface CustomDataListProps {
  customData: CustomDataItem[];
  isLoading: boolean;
}

export function CustomDataList({ customData, isLoading }: CustomDataListProps) {
  const { 
    customDataSources, 
    valueDisplay, 
    stockValueDisplays, 
    entrySpacing,
    symbolDisplay,
    globalDecimals,
    stockDecimals
  } = useStockStore();
  
  const getSpacingClass = () => {
    switch (entrySpacing) {
      case 'compact': return 'space-y-1';
      case 'normal': return 'space-y-3';
      case 'relaxed': return 'space-y-4';
    }
  };

  if (isLoading && customData.length === 0) {
    return (
      <div className={getSpacingClass()}>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (customData.length === 0) {
    return null;
  }

  return (
    <div className={getSpacingClass()}>
      {customData.map((data) => {
        const source = customDataSources.find((s) => s.name === data.name);
        if (!source) return null;

        // Get decimal places for this data source
        const decimals = stockDecimals[data.name] ?? source.decimals ?? globalDecimals;
        
        // Determine name display based on symbolDisplay setting
        const showName = symbolDisplay !== 'hide';
        const showAlias = (symbolDisplay === 'show' || symbolDisplay === 'alias-only') && source.alias;
        const displayName = symbolDisplay === 'alias-only' && source.alias ? source.alias : 
                           symbolDisplay === 'symbol-only' ? data.name :
                           (source.alias || data.name);
        
        const displayValue = data.error
          ? 'Error'
          : typeof data.value === 'number'
          ? data.value.toFixed(decimals)
          : data.value;

        // Determine what to show: use individual preference if set, otherwise use global
        const displayMode = stockValueDisplays[data.name] || valueDisplay;
        const showValue = displayMode === 'price' || displayMode === 'both';
        const showPercentage = displayMode === 'percentage' || displayMode === 'both';
        
        // If we have percentage data
        const hasPercentage = data.changePercent !== undefined && !data.error;
        const isPositive = (data.changePercent || 0) >= 0;

        return (
          <Card key={data.name} className="transition-colors hover:bg-secondary/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {displayName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  {showName && (
                    <div>
                      <h3 className="font-medium">{displayName}</h3>
                      {showAlias && symbolDisplay === 'show' && (
                        <p className="text-sm text-muted-foreground">{source.name}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {data.error ? (
                    <div className="flex items-center space-x-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Error</span>
                    </div>
                  ) : (
                    <>
                      {showValue && (
                        <p className="text-2xl font-bold">
                          {typeof data.value === 'number' ? '$' : ''}{displayValue}
                        </p>
                      )}
                      {showPercentage && hasPercentage && (
                        <div className={`text-sm font-medium mt-1 ${
                          isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {isPositive ? '+' : ''}{data.changePercent?.toFixed(2)}%
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}