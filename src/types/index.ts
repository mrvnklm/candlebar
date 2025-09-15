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
}

export interface CustomDataValue {
  value: number | string;
  decimals: number;
}

export type DisplayMode = 'all' | 'cycle';

export interface StockLogos {
  [key: string]: string;
}