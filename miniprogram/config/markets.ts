import {
  IMarket,
  IMarketScheduleMap,
  IExtendedTradingTime,
} from "../types/market";

export const MARKET_DATA: IMarket[] = [
  {
    id: "cn",
    symbol: "CN",
    name: "A股",
    tzLabel: "CST",
    ianaZone: "Asia/Shanghai",
    exchange: "SHH",
  },
  {
    id: "hk",
    symbol: "HK",
    name: "港股",
    tzLabel: "HKT",
    ianaZone: "Asia/Hong_Kong",
    exchange: "HKSE",
  },
  {
    id: "us",
    symbol: "US",
    name: "美股",
    tzLabel: "EST",
    ianaZone: "America/New_York",
    exchange: "NASDAQ",
  },
  {
    id: "uk",
    symbol: "UK",
    name: "英股",
    tzLabel: "GMT",
    ianaZone: "Europe/London",
    exchange: "LSE",
  },
];

export const FALLBACK_SCHEDULE_MAP: IMarketScheduleMap = {
  SHH: { openTime: "09:30", closeTime: "15:00" },
  HKSE: { openTime: "09:30", closeTime: "16:00" },
  NASDAQ: { openTime: "09:30", closeTime: "16:00" },
  LSE: { openTime: "08:00", closeTime: "16:30" },
};

export const ADD_TRADING_TIME: Record<string, IExtendedTradingTime> = {
  SHH: {
    preStartTime: "09:15",
    preEndTime: "09:30",
    afterStartTime: "15:00",
    afterEndTime: "15:30",
  },
  HKSE: {
    preStartTime: "09:00",
    preEndTime: "09:30",
    afterStartTime: "16:00",
    afterEndTime: "16:10",
  },
  NASDAQ: {
    preStartTime: "04:00",
    preEndTime: "09:30",
    afterStartTime: "16:00",
    afterEndTime: "20:00",
  },
  LSE: {
    preStartTime: "07:50",
    preEndTime: "08:00",
    afterStartTime: "16:30",
    afterEndTime: "17:15",
  },
};
