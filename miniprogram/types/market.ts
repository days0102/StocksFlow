import { MarketId } from "../utils/settings";

export interface IMarket {
  id: MarketId;
  symbol: string;
  name: string;
  tzLabel: string;
  ianaZone: string; // IANA time zone identifier
  exchange: string;
}

export interface ITimeSlot {
  label: string; // Display name, such as "Pre-Market Trading"
  startStr: string; // Start time "04:00"
  endStr: string; // End time "09:30"
  startSec: number; // The number of seconds of the day at the start time
  endSec: number; // The number of seconds of the day at the end time
  duration: number; // Lasts seconds
  colorType: string; // Style type：pre | normal | post
  widthPct: number; // The percentage of width in the progress bar
}

export interface IHoliday {
  id: string;
  name: string;
  dateStr: string;
  statusText: string;
}

export interface IMarketHolidayItem {
  exchange: string;
  date: string;
  name: string;
  isClosed: boolean;
  adjOpenTime: string | null;
  adjCloseTime: string | null;
}

export interface IMarketSchedule {
  openTime: string;
  closeTime: string;
  isOpen?: boolean;
}

export interface IExtendedTradingTime {
  preStartTime?: string;
  preEndTime?: string;
  afterStartTime?: string;
  afterEndTime?: string;
}

export interface IHolidayRange {
  from: string;
  to: string;
  minDate: number;
  maxDate: number;
}

export interface ICalendarDay {
  date: Date;
  className?: string;
  bottomInfo?: string;
}

export type IMarketScheduleMap = Record<string, IMarketSchedule>;
export type IHolidayListMap = Record<string, IMarketHolidayItem[]>;
export type IHolidayLookupMap = Record<string, IMarketHolidayItem>;
