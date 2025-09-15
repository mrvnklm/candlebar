import React from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStockStore } from '@/lib/store';

export function SettingsTab() {
  const { refreshInterval, setRefreshInterval, exportConfig, importConfig } = useStockStore();

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candlebar-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const config = JSON.parse(text);
          importConfig(config);
          alert('Configuration imported successfully!');
        } catch (error) {
          alert('Invalid configuration file');
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Refresh Interval (seconds)</label>
        <Input
          type="number"
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 30)}
          min="10"
          max="300"
        />
        <p className="text-xs text-muted-foreground">
          How often to refresh stock prices (10-300 seconds)
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Configuration</label>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImport} className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Export or import your portfolio configuration
        </p>
      </div>
    </div>
  );
}