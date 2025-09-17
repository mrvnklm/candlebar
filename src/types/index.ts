export interface Stock {
  symbol: string;
  price: number;
  changePercent: number;
  change_percent?: number; // Alternative field name
}

export interface CustomDataSource {
  name: string;
  alias: string;
  url: string;
  path: string;
  decimals: number;
  previousPath?: string; // Optional path to get previous value for percentage calculation
}

export interface CustomDataValue {
  value: number | string;
  decimals: number;
  changePercent?: number; // Optional percentage change if previous value was available
}

export type DisplayMode = 'all' | 'cycle';

export interface StockLogos {
  [key: string]: string;
}