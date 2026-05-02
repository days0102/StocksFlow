import type { IMarketScheduleMap, IMarketHolidayItem } from "../types/market";

const getHolidayStorageKey = (exchange: string, from: string, to: string) =>
  `MARKET_HOLIDAYS_${exchange}_${from}_${to}`;

export class MarketService {
  // Get the global market trading schedule
  static async fetchGlobalMarketSchedule(): Promise<IMarketScheduleMap | null> {
    const today = new Date().toDateString();
    const CACHE_KEY = "ALL_MARKETS_SCHEDULE";

    const localCache = wx.getStorageSync(CACHE_KEY) as
      | { date?: string; data?: IMarketScheduleMap }
      | undefined;

    if (localCache?.date === today && localCache.data) {
      return localCache.data;
    }

    try {
      const res = await wx.cloud.callFunction({ name: "fetchMarketData" });
      const result = res.result as
        | { code?: number; data?: IMarketScheduleMap }
        | undefined;

      if (result?.code === 0 && result.data) {
        wx.setStorageSync(CACHE_KEY, {
          date: today,
          data: result.data,
        });
        return result.data;
      }
      return null;
    } catch (err) {
      console.error("[MarketService] fetchGlobalMarketSchedule failed:", err);
      return null;
    }
  }

  // Get holiday data for the specified exchange
  static async fetchMarketHolidays(
    exchange: string,
    from: string,
    to: string,
  ): Promise<IMarketHolidayItem[] | null> {
    const today = new Date().toDateString();
    const storageKey = getHolidayStorageKey(exchange, from, to);

    const localCache = wx.getStorageSync(storageKey) as
      | { date?: string; data?: IMarketHolidayItem[] }
      | undefined;

    if (localCache?.date === today && Array.isArray(localCache.data)) {
      return localCache.data;
    }

    try {
      const res = await wx.cloud.callFunction({
        name: "fetchMarketHolidays",
        data: { exchange, from, to },
      });
      const result = res.result as
        | { code?: number; data?: IMarketHolidayItem[] }
        | undefined;

      if (result?.code === 0 && Array.isArray(result.data)) {
        wx.setStorageSync(storageKey, {
          date: today,
          data: result.data,
        });
        return result.data;
      }
      return null;
    } catch (err) {
      console.error(
        `[MarketService] fetchMarketHolidays (${exchange}) failed:`,
        err,
      );
      return null;
    }
  }
}
