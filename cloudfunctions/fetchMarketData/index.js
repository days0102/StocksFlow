const cloud = require("wx-server-sdk");
const axios = require("axios");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

let instanceCache = null;
let cacheDate = "";
let fetchPromise = null;

exports.main = async (event, context) => {
  const API_KEY = process.env.FMP_API_KEY;
  if (!API_KEY) {
    console.error("Missing FMP_API_KEY in environment");
    return { code: -2, msg: "Server Config Error" };
  }

  const today = new Date().toDateString();

  if (instanceCache && cacheDate === today) {
    return { code: 0, data: instanceCache, source: "memory" };
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const res = await axios.get(
        "https://financialmodelingprep.com/stable/all-exchange-market-hours",
        {
          params: { apikey: API_KEY },
          timeout: 10000,
        },
      );

      const targetMarkets = ["NASDAQ", "HKSE", "SHH", "LSE"];
      const processedData = {};

      res.data.forEach((item) => {
        if (targetMarkets.includes(item.exchange)) {
          processedData[item.exchange] = {
            openTime: item.openingHour,
            closeTime: item.closingHour,
            isOpen: item.isMarketOpen,
          };
        }
      });

      instanceCache = processedData;
      cacheDate = today;

      return { code: 0, data: processedData, source: "api" };
    } catch (err) {
      console.error("FMP API Error:", err.message);

      if (instanceCache) {
        console.warn("Fallback to stale cache due to API failure");
        return { code: 0, data: instanceCache, source: "stale_memory" };
      }

      return { code: -1, msg: "Fetch failed" };
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};
