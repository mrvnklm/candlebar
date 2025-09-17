import React from 'react';
import { RefreshCw, Settings, DollarSign, Percent, Eye, AlignJustify, Type, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useStockStore, type ValueDisplay, type EntrySpacing, type SymbolDisplay } from '@/lib/store';

interface HeaderProps {
  onRefresh: () => void;
  onOpenSettings: () => void;
  isRefreshing?: boolean;
}

export function Header({ onRefresh, onOpenSettings, isRefreshing }: HeaderProps) {
  const { 
    valueDisplay, 
    setValueDisplay,
    entrySpacing,
    setEntrySpacing,
    symbolDisplay,
    setSymbolDisplay,
    globalDecimals,
    setGlobalDecimals
  } = useStockStore();
  
  const getDisplayIcon = (display: ValueDisplay) => {
    switch (display) {
      case 'price':
        return <DollarSign className="h-4 w-4" />;
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'both':
        return <Eye className="h-4 w-4" />;
    }
  };
  
  const getDisplayLabel = (display: ValueDisplay) => {
    switch (display) {
      case 'price':
        return 'Price Only';
      case 'percentage':
        return 'Percentage Only';
      case 'both':
        return 'Both';
    }
  };
  
  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-gradient-to-br from-green-500 to-blue-500" />
          <span className="text-sm font-semibold">Candlebar</span>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Display Settings"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {getDisplayIcon(valueDisplay)}
                  <span className="ml-2">Value Display</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setValueDisplay('price')}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Price Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setValueDisplay('percentage')}>
                    <Percent className="h-4 w-4 mr-2" />
                    Percentage Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setValueDisplay('both')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Both
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Type className="h-4 w-4 mr-2" />
                  Symbol Display
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setSymbolDisplay('show')}>
                    Show All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSymbolDisplay('symbol-only')}>
                    Symbol Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSymbolDisplay('alias-only')}>
                    Alias Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSymbolDisplay('hide')}>
                    Hide
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <AlignJustify className="h-4 w-4 mr-2" />
                  Entry Spacing
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setEntrySpacing('compact')}>
                    Compact
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEntrySpacing('normal')}>
                    Normal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEntrySpacing('relaxed')}>
                    Relaxed
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Hash className="h-4 w-4 mr-2" />
                  Decimal Places ({globalDecimals})
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {[0, 1, 2, 3, 4].map((num) => (
                    <DropdownMenuItem key={num} onClick={() => setGlobalDecimals(num)}>
                      {num} decimal{num !== 1 ? 's' : ''}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}