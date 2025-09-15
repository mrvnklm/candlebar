import { invoke } from '@tauri-apps/api/core';
import type { Stock, CustomDataSource, CustomDataValue } from '@/types';

export async function fetchStocks(symbols: string[]): Promise<Stock[]> {
  try {
    console.log('Fetching stocks:', symbols);
    const stockData = await invoke<Stock[]>('fetch_stocks', { symbols });
    console.log('Received stock data:', stockData);
    return stockData;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
}

export async function updateTrayTitle(title: string): Promise<void> {
  try {
    await invoke('update_tray_title', { title });
  } catch (error) {
    console.error('Error updating tray title:', error);
  }
}

// Extract value from JSON using path or JS expression
function extractValue(data: any, pathOrExpression: string): any {
  try {
    // If it's a simple path like "value" or "data.value"
    if (!pathOrExpression.includes('(') && !pathOrExpression.includes('[')) {
      const paths = pathOrExpression.split('.');
      let result = data;
      for (const path of paths) {
        result = result[path];
      }
      return result;
    } else {
      // Otherwise treat as JS expression
      const func = new Function('data', `return ${pathOrExpression}`);
      return func(data);
    }
  } catch (e) {
    console.error('Error extracting value:', e);
    return null;
  }
}

export async function fetchCustomData(source: CustomDataSource): Promise<CustomDataValue> {
  try {
    const response = await fetch(source.url);
    const data = await response.json();
    const value = extractValue(data, source.path);
    
    return {
      value: value,
      decimals: source.decimals || 2,
    };
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return {
      value: 'Error',
      decimals: 0,
    };
  }
}

export async function testCustomAPI(url: string, path: string): Promise<any> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const value = extractValue(data, path);
    return value;
  } catch (error) {
    throw error;
  }
}