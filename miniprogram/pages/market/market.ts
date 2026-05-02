import { MARKET_DATA, FALLBACK_SCHEDULE_MAP, ADD_TRADING_TIME } from '../../config/markets'
import { MarketService } from '../../services/marketService'
import type {
  ICalendarDay,
  IHoliday,
  IHolidayListMap,
  IHolidayLookupMap,
  IMarket,
  IMarketHolidayItem,
  IMarketSchedule,
  IMarketScheduleMap,
  ITimeSlot,
} from '../../types/market'
import {
  MarketId,
  createRuntimeData,
  getAppSettings,
  getI18n,
  getMarketLabel,
  syncRuntimeSettings,
} from '../../utils/settings'

type SlotType = 'pre' | 'normal' | 'post'

let timer: number | null = null

const padZero = (value: number) => value.toString().padStart(2, '0')

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(item => parseInt(item, 10))
  return new Date(year, month - 1, day)
}

const formatHolidayCardDate = (dateKey: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parseDateKey(dateKey))

const buildHolidayRange = (baseDate: Date) => {
  const startDate = new Date(baseDate.getFullYear(), 0, 1)
  const endDate = new Date(baseDate.getFullYear(), 11, 31)

  return {
    from: formatDateKey(startDate),
    to: formatDateKey(endDate),
    minDate: startDate.getTime(),
    maxDate: endDate.getTime(),
  }
}

const DEFAULT_HOLIDAY_RANGE = buildHolidayRange(new Date())
const UPCOMING_HOLIDAY_LIMIT = 6

const getHolidayStatusText = (holiday: IMarketHolidayItem) =>
  holiday.isClosed ? 'Market Closed' : 'Adjusted Hours'

const getHolidayBottomInfo = (holiday: IMarketHolidayItem) =>
  holiday.isClosed ? '休市' : '调整'

const normalizeTimeStr = (timeStr?: string | null) => {
  if (!timeStr) return null

  const trimmed = timeStr.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*([AP]M))?$/i)

  if (!match) return null

  let hour = parseInt(match[1], 10)
  const minute = parseInt(match[2], 10)
  const meridiem = match[3]?.toUpperCase()

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) {
    return null
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) return null
    if (meridiem === 'AM') {
      hour = hour === 12 ? 0 : hour
    } else {
      hour = hour === 12 ? 12 : hour + 12
    }
  } else if (hour > 23) {
    return null
  }

  return `${padZero(hour)}:${padZero(minute)}`
}

const timeToSeconds = (timeStr: string) => {
  const [hour, minute] = timeStr.split(':')
  return parseInt(hour, 10) * 3600 + parseInt(minute, 10) * 60
}

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
    localTimeStr: '00:00:00',
    isMarketOpen: false,
    countdownStr: '00:00:00',
    timelineSlots: [] as ITimeSlot[],
    pinPositionPct: 0,
    pinLabel: 'NOW',
    currentSlotIndex: -1,
    upcomingHolidays: [] as IHoliday[],
    currentHolidayLookup: {} as IHolidayLookupMap,
    holidayListMap: {} as IHolidayListMap,
    showCalendar: false,
    minDate: DEFAULT_HOLIDAY_RANGE.minDate,
    maxDate: DEFAULT_HOLIDAY_RANGE.maxDate,
    holidayRangeFrom: DEFAULT_HOLIDAY_RANGE.from,
    holidayRangeTo: DEFAULT_HOLIDAY_RANGE.to,
    marketScheduleMap: {} as IMarketScheduleMap,
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
        },
        () => {
          this.renderCurrentMarket()
          this.updateLocalTime()
        },
      )
    },

    onSwitchMarket(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id as MarketId
      if (id === this.data.currentMarketId) return

      const targetMarket = this.data.marketList.find(market => market.id === id)
      if (!targetMarket) return

      this.setData(
        {
          currentMarketId: id,
          currentMarket: targetMarket,
        },
        () => {
          this.renderCurrentMarket()
        },
      )
    },

    initHolidayRange() {
      const holidayRange = buildHolidayRange(new Date())

      this.setData({
        minDate: holidayRange.minDate,
        maxDate: holidayRange.maxDate,
        holidayRangeFrom: holidayRange.from,
        holidayRangeTo: holidayRange.to,
      })
    },

    async initGlobalMarketData() {
      const allMarketsData = await MarketService.fetchGlobalMarketSchedule()

      if (allMarketsData) {
        this.setData({ marketScheduleMap: allMarketsData })
        this.renderCurrentMarket()
      } else {
        wx.showToast({ title: '获取市场时间失败', icon: 'none' })
      }

      wx.hideLoading()
    },

    buildHolidayLookup(holidayList: IMarketHolidayItem[]) {
      return holidayList.reduce<IHolidayLookupMap>((lookup, holiday) => {
        lookup[holiday.date] = holiday
        return lookup
      }, {})
    },

    buildUpcomingHolidayCards(holidayList: IMarketHolidayItem[]) {
      if (!holidayList || holidayList.length === 0) return []

      const sortedList = [...holidayList].sort((a, b) => a.date.localeCompare(b.date))
      const mergedCards: Array<IMarketHolidayItem & { startDate: string; endDate: string }> = []
      let currentGroup: (typeof mergedCards)[number] | null = null

      for (const holiday of sortedList) {
        if (!currentGroup) {
          currentGroup = {
            ...holiday,
            startDate: holiday.date,
            endDate: holiday.date,
          }
          mergedCards.push(currentGroup)
          continue
        }

        if (currentGroup.name === holiday.name) {
          const prevDate = parseDateKey(currentGroup.endDate).getTime()
          const currDate = parseDateKey(holiday.date).getTime()
          const daysDiff = (currDate - prevDate) / (1000 * 3600 * 24)

          if (daysDiff <= 5) {
            currentGroup.endDate = holiday.date
          } else {
            currentGroup = {
              ...holiday,
              startDate: holiday.date,
              endDate: holiday.date,
            }
            mergedCards.push(currentGroup)
          }
        } else {
          currentGroup = {
            ...holiday,
            startDate: holiday.date,
            endDate: holiday.date,
          }
          mergedCards.push(currentGroup)
        }
      }

      return mergedCards.slice(0, UPCOMING_HOLIDAY_LIMIT).map(group => {
        const isMultiDay = group.startDate !== group.endDate
        const dateStr = isMultiDay
          ? `${formatHolidayCardDate(group.startDate)} - ${formatHolidayCardDate(group.endDate)}`
          : formatHolidayCardDate(group.startDate)

        return {
          id: `${group.exchange}-${group.startDate}`,
          name: group.name,
          dateStr,
          statusText: getHolidayStatusText(group),
        }
      })
    },

    applyHolidayData(exchange: string, holidayList: IMarketHolidayItem[]) {
      const holidayListMap = {
        ...this.data.holidayListMap,
        [exchange]: holidayList,
      }

      const nextData: WechatMiniprogram.IAnyObject = {
        holidayListMap,
      }

      if (this.data.currentMarket.exchange === exchange) {
        nextData.currentHolidayLookup = this.buildHolidayLookup(holidayList)
        nextData.upcomingHolidays = this.buildUpcomingHolidayCards(holidayList)
      }

      this.setData(nextData)
    },

    async ensureHolidayData(exchange: string) {
      const hasLoadedExchange = Object.prototype.hasOwnProperty.call(this.data.holidayListMap, exchange)

      if (hasLoadedExchange) {
        const cachedHolidayList = this.data.holidayListMap[exchange] ?? []
        if (this.data.currentMarket.exchange === exchange) {
          this.setData({
            currentHolidayLookup: this.buildHolidayLookup(cachedHolidayList),
            upcomingHolidays: this.buildUpcomingHolidayCards(cachedHolidayList),
          })
        }
        return
      }

      const { holidayRangeFrom, holidayRangeTo } = this.data
      const resultData = await MarketService.fetchMarketHolidays(exchange, holidayRangeFrom, holidayRangeTo)

      if (resultData) {
        this.applyHolidayData(exchange, resultData)
      } else if (this.data.currentMarket.exchange === exchange) {
        wx.showToast({ title: '获取假期失败', icon: 'none' })
      }
    },

    renderCurrentMarket() {
      const targetMarket = this.data.marketList.find(market => market.id === this.data.currentMarketId)
      if (!targetMarket) return

      const fallbackSchedule = FALLBACK_SCHEDULE_MAP[targetMarket.exchange]
      const marketSchedule = this.data.marketScheduleMap[targetMarket.exchange] ?? fallbackSchedule
      let timelineSlots = this.buildTimelineSlots(targetMarket.exchange, marketSchedule)

      if (timelineSlots.length === 0) {
        timelineSlots = this.buildTimelineSlots(targetMarket.exchange, fallbackSchedule)
      }

      const cachedHolidayList = this.data.holidayListMap[targetMarket.exchange] ?? []

      this.setData(
        {
          currentMarket: targetMarket,
          timelineSlots,
          currentHolidayLookup: this.buildHolidayLookup(cachedHolidayList),
          upcomingHolidays: this.buildUpcomingHolidayCards(cachedHolidayList),
        },
        () => {
          this.updateLocalTime()
          void this.ensureHolidayData(targetMarket.exchange)
        },
      )
    },

    updateLocalTime() {
      const { currentMarket } = this.data
      if (!currentMarket) return

      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: currentMarket.ianaZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      const localTimeStr = formatter.format(now)

      const [hourStr, minStr, secStr] = localTimeStr.split(':')
      this.calculateHeroDashboard(parseInt(hourStr, 10), parseInt(minStr, 10), parseInt(secStr, 10))

      this.setData({ localTimeStr })
    },

    dayFormatter(day: ICalendarDay) {
      day.className = ''
      day.bottomInfo = ''

      const holiday = this.data.currentHolidayLookup[formatDateKey(day.date)]
      if (holiday) {
        day.className = 'day-holiday'
        day.bottomInfo = getHolidayBottomInfo(holiday)
        return day
      }

      const dayOfWeek = day.date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        day.className = 'day-weekend'
        day.bottomInfo = '周末'
      }

      return day
    },

    calculateHeroDashboard(currentHour: number, currentMinute: number, currentSecond: number) {
      const nowSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond
      const { timelineSlots } = this.data

      if (timelineSlots.length === 0) {
        this.setData({
          isMarketOpen: false,
          countdownStr: '00:00:00',
          pinPositionPct: 0,
          currentSlotIndex: -1,
        })
        return
      }

      const tradingSlot = timelineSlots.find(slot => slot.colorType === 'normal') ?? timelineSlots[0]
      const openSeconds = tradingSlot.startSec
      const closeSeconds = tradingSlot.endSec

      let isMarketOpen = false
      let diffSeconds = 0

      if (nowSeconds >= openSeconds && nowSeconds < closeSeconds) {
        isMarketOpen = true
        diffSeconds = closeSeconds - nowSeconds
      } else if (nowSeconds < openSeconds) {
        diffSeconds = openSeconds - nowSeconds
      } else {
        const secondsLeftToday = 24 * 3600 - nowSeconds
        diffSeconds = secondsLeftToday + openSeconds
      }

      const diffH = padZero(Math.floor(diffSeconds / 3600))
      const diffM = padZero(Math.floor((diffSeconds % 3600) / 60))
      const diffS = padZero(diffSeconds % 60)

      const totalStartSec = timelineSlots[0].startSec
      const totalEndSec = timelineSlots[timelineSlots.length - 1].endSec

      let pinPct = 0
      let currentSlotIndex = -1

      if (nowSeconds < totalStartSec) {
        pinPct = 0
      } else if (nowSeconds >= totalEndSec) {
        pinPct = 100
      } else {
        currentSlotIndex = timelineSlots.findIndex(slot => nowSeconds >= slot.startSec && nowSeconds < slot.endSec)

        if (currentSlotIndex !== -1) {
          const activeSlot = timelineSlots[currentSlotIndex]
          const progressInSlot = (nowSeconds - activeSlot.startSec) / activeSlot.duration
          let previousVisualWidths = 0

          for (let index = 0; index < currentSlotIndex; index += 1) {
            previousVisualWidths += timelineSlots[index].widthPct
          }

          pinPct = previousVisualWidths + progressInSlot * activeSlot.widthPct
        }
      }

      this.setData({
        isMarketOpen,
        countdownStr: `${diffH}:${diffM}:${diffS}`,
        pinPositionPct: pinPct,
        currentSlotIndex,
      })
    },

    buildTimelineSlots(exchange: string, schedule: IMarketSchedule): ITimeSlot[] {
      const normalizedOpenTime = normalizeTimeStr(schedule.openTime)
      const normalizedCloseTime = normalizeTimeStr(schedule.closeTime)

      if (!normalizedOpenTime || !normalizedCloseTime) {
        return []
      }

      const normalStartSec = timeToSeconds(normalizedOpenTime)
      const normalEndSec = timeToSeconds(normalizedCloseTime)
      const normalDuration = normalEndSec - normalStartSec

      if (normalDuration <= 0) {
        return []
      }

      const i18n = getI18n(getAppSettings().language)
      const extraTradingTime = ADD_TRADING_TIME[exchange]
      const slots: Array<Omit<ITimeSlot, 'widthPct'>> = []

      const normalizedPreStart = normalizeTimeStr(extraTradingTime?.preStartTime)
      const normalizedPreEnd = normalizeTimeStr(extraTradingTime?.preEndTime)

      if (normalizedPreStart && normalizedPreEnd) {
        const preStartSec = timeToSeconds(normalizedPreStart)
        const preEndSec = timeToSeconds(normalizedPreEnd)
        const preDuration = preEndSec - preStartSec

        if (preDuration > 0 && preEndSec <= normalStartSec) {
          slots.push({
            label: i18n.market.stages.pre,
            startStr: normalizedPreStart,
            endStr: normalizedPreEnd,
            startSec: preStartSec,
            endSec: preEndSec,
            duration: preDuration,
            colorType: 'pre',
          })
        }
      }

      slots.push({
        label: i18n.market.stages.normal,
        startStr: normalizedOpenTime,
        endStr: normalizedCloseTime,
        startSec: normalStartSec,
        endSec: normalEndSec,
        duration: normalDuration,
        colorType: 'normal',
      })

      const normalizedAfterStart = normalizeTimeStr(extraTradingTime?.afterStartTime)
      const normalizedAfterEnd = normalizeTimeStr(extraTradingTime?.afterEndTime)

      if (normalizedAfterStart && normalizedAfterEnd) {
        const afterStartSec = timeToSeconds(normalizedAfterStart)
        const afterEndSec = timeToSeconds(normalizedAfterEnd)
        const afterDuration = afterEndSec - afterStartSec

        if (afterDuration > 0 && afterStartSec >= normalEndSec) {
          slots.push({
            label: i18n.market.stages.post,
            startStr: normalizedAfterStart,
            endStr: normalizedAfterEnd,
            startSec: afterStartSec,
            endSec: afterEndSec,
            duration: afterDuration,
            colorType: 'post',
          })
        }
      }

      const totalStartSec = slots[0]?.startSec
      const totalEndSec = slots[slots.length - 1]?.endSec

      if (
        typeof totalStartSec !== 'number' ||
        typeof totalEndSec !== 'number' ||
        totalEndSec <= totalStartSec
      ) {
        return []
      }

      const slotCount = slots.length

      return slots.map(slot => {
        let visualWidthPct = 100

        if (slotCount === 3) {
          if (slot.colorType === 'pre' || slot.colorType === 'post') visualWidthPct = 20
          if (slot.colorType === 'normal') visualWidthPct = 60
        } else if (slotCount === 2) {
          visualWidthPct = slot.colorType === 'normal' ? 75 : 25
        }

        return {
          ...slot,
          widthPct: visualWidthPct,
        }
      })
    },

    async onTapAllHolidays() {
      await this.ensureHolidayData(this.data.currentMarket.exchange)
      this.setData({ showCalendar: true })
    },

    closeCalendar() {
      this.setData({ showCalendar: false })
    },

    startClock() {
      this.updateLocalTime()
      timer = setInterval(() => {
        this.updateLocalTime()
      }, 1000) as unknown as number
    },

    stopClock() {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    },
  },

  lifetimes: {
    attached() {
      this.initHolidayRange()
      this.renderCurrentMarket()
      this.startClock()
      void this.initGlobalMarketData()
    },
    detached() {
      this.stopClock()
    },
  },

  pageLifetimes: {
    show() {
      this.applySettingState()
      if (!timer) this.startClock()
    },
    hide() {
      this.stopClock()
    },
  },
})
