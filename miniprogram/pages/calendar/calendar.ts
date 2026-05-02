import { MARKET_DATA } from '../../config/markets'
import { MarketService } from '../../services/marketService'
import type { ICalendarDay, IMarket, IMarketHolidayItem, IHolidayRange } from '../../types/market'
import {
  MarketId,
  createRuntimeData,
  getAppSettings,
  getMarketLabel,
  syncRuntimeSettings,
} from '../../utils/settings'

const padZero = (value: number) => value.toString().padStart(2, '0')

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`

const buildCalendarRange = (baseDate: Date): IHolidayRange => {
  const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  const endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 3, 0)

  return {
    from: formatDateKey(startDate),
    to: formatDateKey(endDate),
    minDate: startDate.getTime(),
    maxDate: endDate.getTime(),
  }
}

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(item => parseInt(item, 10))
  return new Date(year, month - 1, day)
}

const formatHolidayBottomInfo = (holiday: IMarketHolidayItem) =>
  holiday.isClosed ? '休市' : '调整'

function buildMarketData() {
  const language = getAppSettings().language
  return MARKET_DATA.map(market => ({
    ...market,
    name: getMarketLabel(market.id, language),
  }))
}

function getInitialMarketData() {
  const marketList = buildMarketData()
  const currentMarketId = getAppSettings().defaultMarket
  return {
    marketList,
    currentMarketId,
    currentMarket: marketList.find(market => market.id === currentMarketId) || marketList[0],
  }
}

Component({
  data: {
    ...createRuntimeData(),
    ...getInitialMarketData(),
    isLoadingHolidays: true,
    minDate: buildCalendarRange(new Date()).minDate,
    maxDate: buildCalendarRange(new Date()).maxDate,
    dayFormatter: null as any,
  },

  methods: {
    applySettingState() {
      syncRuntimeSettings(this)
      const marketList = buildMarketData()
      const currentMarketId = getAppSettings().defaultMarket
      const currentMarket =
        marketList.find((market: IMarket) => market.id === currentMarketId) || marketList[0]

      this.setData(
        {
          marketList,
          currentMarketId,
          currentMarket,
          isLoadingHolidays: true,
          dayFormatter: null,
        },
        () => {
          void this.loadMarketHolidays(currentMarket.exchange)
        },
      )
    },

    onSwitchMarket(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id as MarketId
      if (id === this.data.currentMarketId) return

      const targetMarket = this.data.marketList.find((market: IMarket) => market.id === id)
      if (!targetMarket) return

      this.setData(
        {
          currentMarketId: id,
          currentMarket: targetMarket,
          isLoadingHolidays: true,
          dayFormatter: null,
        },
        () => {
          void this.loadMarketHolidays(targetMarket.exchange)
        },
      )
    },

    async loadMarketHolidays(exchange: string) {
      const { minDate, maxDate } = this.data
      const rangeFrom = formatDateKey(new Date(minDate))
      const rangeTo = formatDateKey(new Date(maxDate))

      try {
        const rawHolidays = await MarketService.fetchMarketHolidays(exchange, rangeFrom, rangeTo)
        const holidayLookupMap = (rawHolidays || []).reduce<Record<string, IMarketHolidayItem>>(
          (lookup, holiday) => {
            lookup[holiday.date] = holiday
            return lookup
          },
          {},
        )

        const formatter = (day: ICalendarDay) => {
          day.className = ''
          day.bottomInfo = ''

          const dateStr = formatDateKey(day.date)
          const holiday = holidayLookupMap[dateStr]
          if (holiday) {
            day.className = 'day-holiday'
            day.bottomInfo = formatHolidayBottomInfo(holiday)
            return day
          }

          const dayOfWeek = day.date.getDay()
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            day.className = 'day-weekend'
            day.bottomInfo = '周末'
          }

          return day
        }

        this.setData({
          dayFormatter: formatter,
          isLoadingHolidays: false,
        })
      } catch (err) {
        console.error(`[Calendar] 拉取 ${exchange} 假期数据失败:`, err)
        this.setData({
          isLoadingHolidays: false,
          dayFormatter: (day: ICalendarDay) => {
            day.className = ''
            day.bottomInfo = ''

            if (day.date.getDay() === 0 || day.date.getDay() === 6) {
              day.className = 'day-weekend'
              day.bottomInfo = '周末'
            }

            return day
          },
        })
      }
    },
  },

  lifetimes: {
    attached() {
      this.applySettingState()
    },
  },

  pageLifetimes: {
    show() {
      this.applySettingState()
    },
  },
})
