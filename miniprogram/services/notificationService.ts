import {
  LanguageCode,
  MarketId,
  SUBSCRIBE_TEMPLATE_IDS,
  getAppSettings,
} from "../utils/settings";

export type TimingValue = "at_open" | "5min_before" | "15min_before";
export type NotificationStatus = "local" | "sent" | "failed";
export type MiniProgramState = "developer" | "trial" | "formal";
export type SubscribeMessageLang = "zh_CN" | "zh_TW" | "en_US";

export interface SubscribeTemplateFields {
  title: string;
  marketName: string;
  openTime: string;
  status: string;
  timing: string;
}

export interface SubscribeTemplateConfig {
  templateIds: string[];
  fields: SubscribeTemplateFields;
}

export interface NotificationSubscription {
  marketId: MarketId;
  enabled: boolean;
  timing: TimingValue;
}

export interface NotificationMessage {
  id: string;
  type: string;
  title: string;
  marketName: string;
  time: string;
  date: string;
  content: string;
  read: boolean;
  status: NotificationStatus;
  createdAt: number;
}

export interface SubscribeAuthorizationResult {
  acceptedTemplateIds: string[];
  rejectedTemplateIds: string[];
  failed: boolean;
  errMsg: string;
}

export interface SendSubscribeMessagePayload {
  templateId: string;
  page?: string;
  data: Record<string, { value: string }>;
  miniprogramState?: MiniProgramState;
  lang?: SubscribeMessageLang;
  notification: Omit<NotificationMessage, "id" | "read" | "status" | "createdAt">;
}

export interface SendSubscribeMessageResult {
  ok: boolean;
  code: number;
  msg: string;
  notification?: NotificationMessage;
}

const SUBSCRIPTION_STORAGE_KEY = "settings_subscriptions";
const AUTH_STORAGE_KEY = "notification_subscribe_authorizations";
const MESSAGE_STORAGE_KEY = "notification_messages";
const TEMPLATE_CONFIG_STORAGE_KEY = "notification_template_config";
const SEND_FUNCTION_NAME = "sendSubscribeMessage";
const DEFAULT_NOTIFICATION_PAGE = "pages/notification/notification";
const MAX_MESSAGE_COUNT = 80;
const DEFAULT_TEMPLATE_FIELDS: SubscribeTemplateFields = {
  title: "thing1",
  marketName: "thing6",
  openTime: "time8",
  status: "thing3",
  timing: "thing5",
};

function uniqueIds(ids: string[]) {
  const seen = new Set<string>();
  return ids
    .map(id => String(id || "").trim())
    .filter((id) => {
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function createId(prefix = "notification") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readArray<T>(key: string): T[] {
  const value = wx.getStorageSync(key);
  return Array.isArray(value) ? value : [];
}

function readTemplateConfig(): SubscribeTemplateConfig {
  const stored = wx.getStorageSync(TEMPLATE_CONFIG_STORAGE_KEY) as
    | Partial<SubscribeTemplateConfig>
    | undefined;

  return {
    templateIds: uniqueIds([
      ...SUBSCRIBE_TEMPLATE_IDS,
      ...(Array.isArray(stored?.templateIds) ? stored.templateIds : []),
    ]),
    fields: {
      ...DEFAULT_TEMPLATE_FIELDS,
      ...(stored?.fields || {}),
    },
  };
}

function getMiniProgramState(): MiniProgramState {
  const envVersion = wx.getAccountInfoSync?.()?.miniProgram?.envVersion;
  if (envVersion === "release") return "formal";
  if (envVersion === "trial") return "trial";
  return "developer";
}

function getSubscribeMessageLang(language: LanguageCode): SubscribeMessageLang {
  if (language === "zh-TW") return "zh_TW";
  if (language === "en") return "en_US";
  return "zh_CN";
}

function buildTemplateData(fields: SubscribeTemplateFields, values: Record<keyof SubscribeTemplateFields, string>) {
  return Object.keys(fields).reduce((acc, key) => {
    const typedKey = key as keyof SubscribeTemplateFields;
    const fieldKey = fields[typedKey];
    if (fieldKey) {
      acc[fieldKey] = { value: values[typedKey] };
    }
    return acc;
  }, {} as Record<string, { value: string }>);
}

function todayParts() {
  const now = new Date();
  return {
    date: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
    time: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
  };
}

export function getStoredSubscriptions(): NotificationSubscription[] {
  return readArray<NotificationSubscription>(SUBSCRIPTION_STORAGE_KEY);
}

export function saveStoredSubscriptions(subscriptions: NotificationSubscription[]) {
  wx.setStorageSync(SUBSCRIPTION_STORAGE_KEY, subscriptions);
}

export function getSubscribeTemplateConfig(): SubscribeTemplateConfig {
  return readTemplateConfig();
}

export function getConfiguredSubscribeTemplateIds(): string[] {
  return getSubscribeTemplateConfig().templateIds;
}

export async function refreshSubscribeTemplateConfig(): Promise<SubscribeTemplateConfig> {
  if (!wx.cloud || typeof wx.cloud.callFunction !== "function") {
    return getSubscribeTemplateConfig();
  }

  try {
    const res = await wx.cloud.callFunction({
      name: SEND_FUNCTION_NAME,
      data: { action: "getConfig" },
    });
    const result = res.result as
      | {
        code?: number;
        data?: Partial<SubscribeTemplateConfig>;
      }
      | undefined;

    if (result?.code === 0 && result.data) {
      const mergedConfig: SubscribeTemplateConfig = {
        templateIds: uniqueIds([
          ...SUBSCRIBE_TEMPLATE_IDS,
          ...(Array.isArray(result.data.templateIds) ? result.data.templateIds : []),
        ]),
        fields: {
          ...DEFAULT_TEMPLATE_FIELDS,
          ...(result.data.fields || {}),
        },
      };
      wx.setStorageSync(TEMPLATE_CONFIG_STORAGE_KEY, mergedConfig);
      return mergedConfig;
    }
  } catch (error) {
    console.warn("[NotificationService] refresh template config failed:", error);
  }

  return getSubscribeTemplateConfig();
}

export function getNotificationMessages(): NotificationMessage[] {
  return readArray<NotificationMessage>(MESSAGE_STORAGE_KEY);
}

export function saveNotificationMessages(messages: NotificationMessage[]) {
  wx.setStorageSync(MESSAGE_STORAGE_KEY, messages.slice(0, MAX_MESSAGE_COUNT));
}

export function addNotificationMessage(
  message: Omit<NotificationMessage, "id" | "read" | "status" | "createdAt"> & {
    id?: string;
    read?: boolean;
    status?: NotificationStatus;
    createdAt?: number;
  },
): NotificationMessage {
  const fullMessage: NotificationMessage = {
    id: message.id || createId("msg"),
    type: message.type,
    title: message.title,
    marketName: message.marketName,
    time: message.time,
    date: message.date,
    content: message.content,
    read: message.read ?? false,
    status: message.status || "local",
    createdAt: message.createdAt || Date.now(),
  };

  saveNotificationMessages([fullMessage, ...getNotificationMessages()]);
  return fullMessage;
}

export function markNotificationMessageRead(index: number) {
  const messages = getNotificationMessages();
  if (!messages[index]) return;
  messages[index] = { ...messages[index], read: true };
  saveNotificationMessages(messages);
}

export function requestSubscribeAuthorization(tmplIds: string[]): Promise<SubscribeAuthorizationResult> {
  if (tmplIds.length === 0) {
    return Promise.resolve({
      acceptedTemplateIds: [],
      rejectedTemplateIds: [],
      failed: true,
      errMsg: "template id is not configured",
    });
  }

  if (typeof wx.requestSubscribeMessage !== "function") {
    return Promise.resolve({
      acceptedTemplateIds: [],
      rejectedTemplateIds: tmplIds,
      failed: true,
      errMsg: "wx.requestSubscribeMessage is unavailable",
    });
  }

  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds,
      success: (res: any) => {
        const acceptedTemplateIds = tmplIds.filter(id => (res as Record<string, string>)[id] === "accept");
        const rejectedTemplateIds = tmplIds.filter(id => (res as Record<string, string>)[id] !== "accept");
        wx.setStorageSync(AUTH_STORAGE_KEY, {
          updatedAt: Date.now(),
          acceptedTemplateIds,
          rejectedTemplateIds,
          raw: res,
        });
        resolve({
          acceptedTemplateIds,
          rejectedTemplateIds,
          failed: false,
          errMsg: res.errMsg || "",
        });
      },
      fail: (res) => {
        wx.setStorageSync(AUTH_STORAGE_KEY, {
          updatedAt: Date.now(),
          acceptedTemplateIds: [],
          rejectedTemplateIds: tmplIds,
          raw: res,
        });
        resolve({
          acceptedTemplateIds: [],
          rejectedTemplateIds: tmplIds,
          failed: true,
          errMsg: res.errMsg || "requestSubscribeMessage failed",
        });
      },
    });
  });
}

export function buildMarketOpenSubscribePayload(options: {
  templateId: string;
  marketName: string;
  timingLabel: string;
  openTime: string;
  fields?: Partial<SubscribeTemplateFields>;
}): SendSubscribeMessagePayload {
  const { date, time } = todayParts();
  const title = `${options.marketName}开盘提醒`;
  const content = `${options.marketName}${options.timingLabel}，开盘时间 ${options.openTime}`;
  const fields = {
    ...getSubscribeTemplateConfig().fields,
    ...(options.fields || {}),
  };

  return {
    templateId: options.templateId,
    page: DEFAULT_NOTIFICATION_PAGE,
    miniprogramState: getMiniProgramState(),
    lang: getSubscribeMessageLang(getAppSettings().language),
    data: buildTemplateData(fields, {
      title: title.slice(0, 20),
      marketName: `${options.marketName}${options.timingLabel}`.slice(0, 20),
      openTime: `${date} ${options.openTime}`,
      status: "即将开盘",
      timing: options.timingLabel.slice(0, 20),
    }),
    notification: {
      type: "market_open",
      title,
      marketName: options.marketName,
      time,
      date,
      content,
    },
  };
}

export async function sendSubscribeMessage(payload: SendSubscribeMessagePayload): Promise<SendSubscribeMessageResult> {
  if (!payload.templateId) {
    return { ok: false, code: -2, msg: "template id is not configured" };
  }

  if (!wx.cloud || typeof wx.cloud.callFunction !== "function") {
    return { ok: false, code: -3, msg: "wx.cloud.callFunction is unavailable" };
  }

  try {
    const res = await wx.cloud.callFunction({
      name: SEND_FUNCTION_NAME,
      data: {
        templateId: payload.templateId,
        page: payload.page || DEFAULT_NOTIFICATION_PAGE,
        data: payload.data,
        miniprogramState: payload.miniprogramState || getMiniProgramState(),
        lang: payload.lang || getSubscribeMessageLang(getAppSettings().language),
      },
    });
    const result = res.result as { code?: number; msg?: string } | undefined;

    if (result?.code === 0) {
      const notification = addNotificationMessage({
        ...payload.notification,
        status: "sent",
      });
      return { ok: true, code: 0, msg: result.msg || "ok", notification };
    }

    const failedNotification = addNotificationMessage({
      ...payload.notification,
      status: "failed",
      read: true,
    });
    return {
      ok: false,
      code: result?.code ?? -1,
      msg: result?.msg || "sendSubscribeMessage failed",
      notification: failedNotification,
    };
  } catch (error) {
    const failedNotification = addNotificationMessage({
      ...payload.notification,
      status: "failed",
      read: true,
    });
    return {
      ok: false,
      code: -1,
      msg: error instanceof Error ? error.message : "sendSubscribeMessage failed",
      notification: failedNotification,
    };
  }
}
