import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { STOCK_LOGOS } from '@/lib/constants';
import { useStockStore } from '@/lib/store';
import type { Stock } from '@/types';

interface StockItemProps {
  stock: Stock;
  alias?: string;
}

export const StockItem = React.memo(function StockItem({ stock, alias }: StockItemProps) {
  const { 
    valueDisplay, 
    stockValueDisplays, 
    symbolDisplay, 
    globalDecimals, 
    stockDecimals 
  } = useStockStore();
  
  const changePercent = stock.changePercent || stock.change_percent || 0;
  const isPositive = changePercent >= 0;
  const logoUrl = STOCK_LOGOS[stock.symbol];
  
  // Determine what to show: use individual preference if set, otherwise use global
  const displayMode = stockValueDisplays[stock.symbol] || valueDisplay;
  const showPrice = displayMode === 'price' || displayMode === 'both';
  const showPercentage = displayMode === 'percentage' || displayMode === 'both';
  
  // If both values are supposed to be hidden (shouldn't happen), default to showing both
  const effectiveShowPrice = showPrice || (!showPrice && !showPercentage);
  const effectiveShowPercentage = showPercentage || (!showPrice && !showPercentage);
  
  // Get decimal places for this stock
  const decimals = stockDecimals[stock.symbol] ?? globalDecimals;
  
  // Determine symbol display
  const showSymbol = symbolDisplay === 'show' || symbolDisplay === 'symbol-only';
  const showAlias = (symbolDisplay === 'show' || symbolDisplay === 'alias-only') && alias;
  const displayName = symbolDisplay === 'alias-only' && alias ? alias : 
                      symbolDisplay === 'symbol-only' ? stock.symbol :
                      (alias || stock.symbol);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-3 transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={stock.symbol}
              className="h-8 w-8 rounded-full bg-white p-1 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted" />
          )}
          {symbolDisplay !== 'hide' && (
            <div>
              <div className="font-semibold text-sm">{displayName}</div>
              {showAlias && showSymbol && symbolDisplay === 'show' && (
                <div className="text-xs text-muted-foreground">{stock.symbol}</div>
              )}
            </div>
          )}
        </div>
        <div className="text-right">
          {effectiveShowPrice && (
            <div className="font-semibold">${stock.price.toFixed(decimals)}</div>
          )}
          {effectiveShowPercentage && (
            <div
              className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded',
                effectiveShowPrice ? 'mt-0.5' : '', // Add margin only if price is shown
                isPositive
                  ? 'text-green-500 bg-green-500/10'
                  : 'text-red-500 bg-red-500/10'
              )}
            >
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </div>
          )}
        </div>
      </div>
    </Card>
    </motion.div>
  );
});