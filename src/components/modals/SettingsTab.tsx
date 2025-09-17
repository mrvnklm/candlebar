import React, { useEffect } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useStockStore } from '@/lib/store';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/components/ui/use-toast';

export function SettingsTab() {
  const { refreshInterval, setRefreshInterval, exportConfig, importConfig, autostart, setAutostart } = useStockStore();
  const { toast } = useToast();

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

  const handleAutostartToggle = async (enabled: boolean) => {
    try {
      await invoke('set_autostart', { enable: enabled });
      setAutostart(enabled);
      toast({
        title: enabled ? 'Autostart Enabled' : 'Autostart Disabled',
        description: enabled 
          ? 'Candlebar will start automatically at login' 
          : 'Candlebar will not start automatically',
      });
    } catch (error) {
      console.error('Failed to update autostart:', error);
      toast({
        title: 'Error',
        description: 'Failed to update autostart setting',
        variant: 'destructive',
      });
    }
  };

  // Initialize autostart status on mount
  useEffect(() => {
    const checkAutostartStatus = async () => {
      try {
        const isEnabled = await invoke<boolean>('get_autostart');
        setAutostart(isEnabled);
      } catch (error) {
        console.error('Failed to check autostart status:', error);
      }
    };
    checkAutostartStatus();
  }, [setAutostart]);

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
        <div className="flex items-center space-x-2">
          <Switch
            id="autostart"
            checked={autostart}
            onCheckedChange={handleAutostartToggle}
          />
          <Label htmlFor="autostart" className="cursor-pointer">
            Start automatically at login
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Launch Candlebar when you start your computer
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