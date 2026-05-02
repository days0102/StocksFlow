const cloud = require("wx-server-sdk");
const axios = require("axios");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const HOLIDAY_API_URL =
  "https://financialmodelingprep.com/stable/holidays-by-exchange";

const cacheMap = new Map();
const fetchPromises = new Map();
let lastCacheDate = "";

const buildRangeDate = (baseDate, yearOffset) => {
  const targetDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
  );
  targetDate.setFullYear(targetDate.getFullYear() + yearOffset);

  const year = targetDate.getFullYear();
  const month = `${targetDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${targetDate.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

exports.main = async (event) => {
  const API_KEY = process.env.FMP_API_KEY;
  if (!API_KEY) {
    console.error("SERVER ERROR: Missing FMP_API_KEY");
    return { code: -2, msg: "Server Config Error" };
  }

  const today = new Date();
  const todayStr = today.toDateString();

  if (lastCacheDate !== todayStr) {
    cacheMap.clear();
    lastCacheDate = todayStr;
  }

  const exchange = event?.exchange;
  const from = event?.from || buildRangeDate(today, 0);
  const to = event?.to || buildRangeDate(today, 1);

  if (!exchange) {
    return { code: -1, msg: "exchange is required" };
  }

  const cacheKey = `${exchange}:${from}:${to}`;

  if (cacheMap.has(cacheKey)) {
    return { code: 0, data: cacheMap.get(cacheKey), source: "memory" };
  }

  if (fetchPromises.has(cacheKey)) {
    return fetchPromises.get(cacheKey);
  }

  const fetchTask = (async () => {
    try {
      const res = await axios.get(HOLIDAY_API_URL, {
        params: {
          exchange,
          from,
          to,
          apikey: API_KEY,
        },
        timeout: 10000,
      });

      const holidayList = Array.isArray(res.data) ? res.data : [];

      const normalizedList = holidayList
        .filter((item) => item?.exchange && item?.date && item?.name)
        .map((item) => ({
          exchange: item.exchange,
          date: item.date,
          name: item.name,
          isClosed: Boolean(item.isClosed),
          adjOpenTime: item.adjOpenTime ?? null,
          adjCloseTime: item.adjCloseTime ?? null,
        }))
        .sort((left, right) => left.date.localeCompare(right.date));

      cacheMap.set(cacheKey, normalizedList);

      return { code: 0, data: normalizedList, source: "api" };
    } catch (error) {
      console.error(
        `[${exchange}] Holiday API Error:`,
        error?.response?.data || error.message,
      );
      return { code: -1, msg: "Fetch failed" };
    } finally {
      fetchPromises.delete(cacheKey);
    }
  })();

  fetchPromises.set(cacheKey, fetchTask);

  return fetchTask;
};
