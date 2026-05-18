import {
  MOCK_MARKET_SCHEDULE,
  MOCK_SSE_HOLIDAYS,
  MOCK_HKSE_HOLIDAYS,
  MOCK_LSE_HOLIDAYS,
  MOCK_NASDAQ_HOLIDAYS,
} from "../config/mock";

interface MockCallFunctionParam {
  name: string;
  data?: any;
  config?: any;
}

export const injectCloudMock = () => {
  if (!wx.cloud) {
    (wx as any).cloud = {};
  }

  const originalCallFunction = wx.cloud.callFunction;

  (wx as any).cloud.callFunction = async function (
    params: MockCallFunctionParam,
  ) {
    const { name, data } = params;

    await new Promise((resolve) => setTimeout(resolve, 500));

    switch (name) {
      case "fetchMarketData":
        return {
          result: { code: 0, data: MOCK_MARKET_SCHEDULE },
        };
      case "fetchMarketHolidays":
        const exchange = data.exchange;
        switch (exchange) {
          case "SSE":
            return {
              result: { code: 0, data: MOCK_SSE_HOLIDAYS },
            };
          case "HKSE":
            return {
              result: { code: 0, data: MOCK_HKSE_HOLIDAYS },
            };
          case "NASDAQ":
            return {
              result: { code: 0, data: MOCK_NASDAQ_HOLIDAYS },
            };
          case "LSE":
            return {
              result: { code: 0, data: MOCK_LSE_HOLIDAYS },
            };
          default:
            return {
              result: { code: 0, data: MOCK_SSE_HOLIDAYS },
            };
        }
      case "sendSubscribeMessage":
        if (originalCallFunction) {
          return originalCallFunction.call(this, params);
        }
        if (data?.action === "getConfig") {
          return {
            result: {
              code: 0,
              data: {
                templateIds: [],
                fields: {
                  title: "thing1",
                  marketName: "thing6",
                  openTime: "time8",
                  status: "thing3",
                  timing: "thing5",
                },
              },
            },
          };
        }
        return {
          result: {
            code: 0,
            msg: "mock subscribe message sent",
            data: {
              errCode: 0,
              errMsg: "openapi.subscribeMessage.send:ok",
              templateId: data?.templateId,
              page: data?.page,
            },
          },
        };

      default:
        if (originalCallFunction) {
          return originalCallFunction(params);
        }
        return Promise.reject(
          new Error(`[Mock] 未找到云函数 ${name} 的模拟数据`),
        );
    }
  };
};
