const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const DEFAULT_PAGE = "pages/notification/notification";
const DEFAULT_MINIPROGRAM_STATE = process.env.MINIPROGRAM_STATE || "formal";
const DEFAULT_LANG = process.env.SUBSCRIBE_MESSAGE_LANG || "zh_CN";
const DEFAULT_TEMPLATE_FIELDS = {
  title: "thing1",
  marketName: "thing6",
  openTime: "time8",
  status: "thing3",
  timing: "thing5",
};

const parseTemplateIds = () => {
  const raw =
    process.env.SUBSCRIBE_TEMPLATE_IDS || process.env.SUBSCRIBE_TEMPLATE_ID || "";
  return raw
    .split(/[\s,;]+/)
    .map((id) => id.trim())
    .filter(Boolean);
};

const parseTemplateFields = () => {
  if (!process.env.SUBSCRIBE_TEMPLATE_FIELDS) {
    return DEFAULT_TEMPLATE_FIELDS;
  }

  try {
    return {
      ...DEFAULT_TEMPLATE_FIELDS,
      ...JSON.parse(process.env.SUBSCRIBE_TEMPLATE_FIELDS),
    };
  } catch (error) {
    console.warn("Invalid SUBSCRIBE_TEMPLATE_FIELDS:", error);
    return DEFAULT_TEMPLATE_FIELDS;
  }
};

const getConfig = () => ({
  code: 0,
  data: {
    templateIds: parseTemplateIds(),
    fields: parseTemplateFields(),
  },
});

const normalizeMiniProgramState = (value) => {
  if (["developer", "trial", "formal"].includes(value)) return value;
  return DEFAULT_MINIPROGRAM_STATE;
};

const normalizeLang = (value) => {
  if (["zh_CN", "zh_TW", "en_US"].includes(value)) return value;
  return DEFAULT_LANG;
};

const normalizeData = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  return Object.keys(data).reduce((acc, key) => {
    const value = data[key];
    if (value && typeof value === "object" && "value" in value) {
      acc[key] = { value: String(value.value).slice(0, 200) };
    } else if (value !== undefined && value !== null) {
      acc[key] = { value: String(value).slice(0, 200) };
    }
    return acc;
  }, {});
};

exports.main = async (event) => {
  if (event?.action === "getConfig") {
    return getConfig();
  }

  const wxContext = cloud.getWXContext();
  const templateId = event?.templateId || parseTemplateIds()[0];
  const data = normalizeData(event?.data);

  if (!templateId) {
    return { code: -2, msg: "templateId is required" };
  }

  if (!data || Object.keys(data).length === 0) {
    return { code: -3, msg: "message data is required" };
  }

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: wxContext.OPENID,
      templateId,
      page: event?.page || DEFAULT_PAGE,
      data,
      miniprogramState: normalizeMiniProgramState(event?.miniprogramState),
      lang: normalizeLang(event?.lang),
    });

    return { code: 0, msg: "ok", data: result };
  } catch (error) {
    console.error("subscribeMessage.send failed:", error);
    return {
      code: -1,
      msg: error?.errMsg || error?.message || "subscribeMessage.send failed",
      errCode: error?.errCode,
      data: error,
    };
  }
};
