import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { STOCK_LOGOS } from '@/lib/constants';
import { useStockStore } from '@/lib/store';
import { AlertCircle } from 'lucide-react';
import type { Stock } from '@/types';

interface DataItemProps {
  type: 'stock' | 'custom';
  symbol: string;
  alias?: string;
  price?: number;
  changePercent?: number;
  value?: number | string;
  decimals?: number;
  error?: string | null;
  logoUrl?: string;
}

export const DataItem = React.memo(function DataItem(props: DataItemProps) {
  const { 
    valueDisplay, 
    stockValueDisplays, 
    symbolDisplay, 
    globalDecimals, 
    stockDecimals 
  } = useStockStore();
  
  const {
    type,
    symbol,
    alias,
    price,
    changePercent = 0,
    value,
    decimals: providedDecimals,
    error,
    logoUrl: providedLogoUrl
  } = props;
  
  // Get logo URL for stocks
  const logoUrl = type === 'stock' ? (providedLogoUrl || STOCK_LOGOS[symbol]) : undefined;
  
  // Determine what values to show
  const displayMode = stockValueDisplays[symbol] || valueDisplay;
  const showPrice = displayMode === 'price' || displayMode === 'both';
  const showPercentage = displayMode === 'percentage' || displayMode === 'both';
  
  // If both values are supposed to be hidden, default to showing both
  const effectiveShowPrice = showPrice || (!showPrice && !showPercentage);
  const effectiveShowPercentage = showPercentage || (!showPrice && !showPercentage);
  
  // Get decimal places - use provided decimals for custom data, otherwise use settings
  const decimals = stockDecimals[symbol] ?? providedDecimals ?? globalDecimals;
  
  // Determine symbol/name display
  const showSymbol = symbolDisplay === 'show' || symbolDisplay === 'symbol-only';
  const showAlias = (symbolDisplay === 'show' || symbolDisplay === 'alias-only') && alias;
  const displayName = symbolDisplay === 'alias-only' && alias ? alias : 
                      symbolDisplay === 'symbol-only' ? symbol :
                      (alias || symbol);
  
  // Determine if we have percentage data
  const hasPercentage = changePercent !== undefined && changePercent !== null && !error;
  const isPositive = changePercent >= 0;
  
  // Format the main value
  const mainValue = type === 'stock' ? price : value;
  const formattedValue = typeof mainValue === 'number' 
    ? mainValue.toFixed(decimals)
    : mainValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-3 transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {type === 'stock' && logoUrl ? (
              <img
                src={logoUrl}
                alt={symbol}
                className="h-8 w-8 rounded-full bg-white p-1 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : type === 'custom' ? (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {displayName.slice(0, 2).toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted" />
            )}
            {symbolDisplay !== 'hide' && (
              <div>
                <div className="font-semibold text-sm">{displayName}</div>
                {showAlias && showSymbol && symbolDisplay === 'show' && (
                  <div className="text-xs text-muted-foreground">
                    {type === 'stock' ? symbol : 'Custom API'}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            {error ? (
              <div className="flex items-center space-x-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Error</span>
              </div>
            ) : (
              <>
                {effectiveShowPrice && mainValue !== undefined && mainValue !== null && (
                  <div className="font-semibold">
                    {type === 'stock' ? `$${formattedValue}` : 
                     typeof mainValue === 'number' ? `$${formattedValue}` :
                     mainValue}
                  </div>
                )}
                {effectiveShowPercentage && hasPercentage && (
                  <div
                    className={cn(
                      'text-xs font-medium px-1.5 py-0.5 rounded inline-block',
                      effectiveShowPrice ? 'mt-0.5' : '',
                      isPositive
                        ? 'text-green-500 bg-green-500/10'
                        : 'text-red-500 bg-red-500/10'
                    )}
                  >
                    {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
});