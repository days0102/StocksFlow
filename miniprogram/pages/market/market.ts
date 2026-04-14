interface IMarket {
  id: string,
  symbol: string;
  name: string;
  tzLabel: string;
  ianaZone: string; // IANA time zone identifier
}

interface ITimeSlot {
  label: string;      // Display name, such as "Pre-Market Trading"
  startStr: string;   // Start time "04:00"
  endStr: string;     // End time "09:30"
  startSec: number;   // The number of seconds of the day at the start time
  endSec: number;     // The number of seconds of the day at the end time
  duration: number;   // Lasts seconds
  colorType: string;  // Style type：pre | normal | post
  widthPct: number;   // The percentage of width in the progress bar
}

interface IHoliday {
  id: string;
  name: string;
  dateStr: string;
  statusText: string;
}

const MARKET_DATA: IMarket[] = [
  { id: 'cn', symbol: 'CN', name: 'A股', tzLabel: 'CST', ianaZone: 'Asia/Shanghai' },
  { id: 'hk', symbol: 'HK', name: '港股', tzLabel: 'HKT', ianaZone: 'Asia/Hong_Kong' },
  { id: 'us', symbol: 'US', name: '美股', tzLabel: 'EST', ianaZone: 'America/New_York' },
  { id: 'uk', symbol: 'UK', name: '英股', tzLabel: 'GMT', ianaZone: 'Europe/London' },
]

const RAW_SLOTS = [
  { label: '盘前交易', startStr: '04:00', endStr: '09:30', colorType: 'pre' },
  { label: '正常交易', startStr: '09:30', endStr: '16:00', colorType: 'normal' },
  { label: '盘后交易', startStr: '16:00', endStr: '20:00', colorType: 'post' }
]

const MOCK_HOLIDAYS: IHoliday[] = [
  { id: 'h1', name: 'Memorial Day', dateStr: 'May 25, 2026', statusText: 'Market Closed' },
  { id: 'h2', name: 'Juneteenth', dateStr: 'Jun 19, 2026', statusText: 'Market Closed' },
  { id: 'h3', name: 'Independence Day', dateStr: 'Jul 3, 2026', statusText: 'Early Close' },
]

let timer: number | null = null;

Component({
  data: {
    marketList: MARKET_DATA,
    currentMarketId: 'cn',
    currentMarket: MARKET_DATA[0],
    localTimeStr: '00:00:00',

    isMarketOpen: false,
    countdownStr: '00:00:00',

    timelineSlots: [] as ITimeSlot[],
    pinPositionPct: 0,
    pinLabel: 'NOW',
    currentSlotIndex: -1,

    upcomingHolidays: MOCK_HOLIDAYS,
  },

  methods: {
    onSwitchMarket(e: WechatMiniprogram.TouchEvent) {
      const { id } = e.currentTarget.dataset;
      if (id === this.data.currentMarketId) return;

      const targetMarket = this.data.marketList.find(m => m.id === id);
      if (targetMarket) {
        // Updates the currently selected market and triggers a time refresh immediately
        this.setData({
          currentMarketId: id,
          currentMarket: targetMarket
        }, () => {
          this.updateLocalTime();
        });
      }
    },

    updateLocalTime() {
      const { currentMarket } = this.data;
      if (!currentMarket) return;

      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: currentMarket.ianaZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const localTimeStr = formatter.format(now);

      const [hourStr, minStr, secStr] = localTimeStr.split(':');
      const h = parseInt(hourStr, 10);
      const m = parseInt(minStr, 10);
      const s = parseInt(secStr, 10);
      this.calculateHeroDashboard(h, m, s);

      this.setData({
        localTimeStr: localTimeStr
      });
    },

    calculateHeroDashboard(currentHour: number, currentMinute: number, currentSecond: number) {
      const nowSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;

      // Suppose it opens at 09:30 and closes at 16:00
      const openSeconds = 9 * 3600 + 30 * 60;
      const closeSeconds = 16 * 3600;

      let isMarketOpen = false;
      let diffSeconds = 0;

      if (nowSeconds >= openSeconds && nowSeconds < closeSeconds) {
        // Trading
        isMarketOpen = true;
        diffSeconds = closeSeconds - nowSeconds;
      } else {
        // The market has been closed
        isMarketOpen = false;
        if (nowSeconds < openSeconds) {
          diffSeconds = openSeconds - nowSeconds;
        } else {
          const secondsLeftToday = 24 * 3600 - nowSeconds;
          diffSeconds = secondsLeftToday + openSeconds;
        }
      }
      const padZero = (n: number) => n.toString().padStart(2, '0');
      const diffH = padZero(Math.floor(diffSeconds / 3600));
      const diffM = padZero(Math.floor((diffSeconds % 3600) / 60));
      const diffS = padZero(diffSeconds % 60);


      const { timelineSlots } = this.data;
      if (timelineSlots.length === 0) return;
      const totalStartSec = timelineSlots[0].startSec;
      const totalEndSec = timelineSlots[timelineSlots.length - 1].endSec;
      const totalDuration = totalEndSec - totalStartSec;

      let pinPct = 0;
      let currentSlotIndex = -1;

      if (nowSeconds < totalStartSec) {
        pinPct = 0;
      } else if (nowSeconds > totalEndSec) {
        pinPct = 100;
      } else {
        pinPct = ((nowSeconds - totalStartSec) / totalDuration) * 100;
        currentSlotIndex = timelineSlots.findIndex(s => nowSeconds >= s.startSec && nowSeconds < s.endSec);
      }

      this.setData({
        isMarketOpen,
        countdownStr: `${diffH}:${diffM}:${diffS}`,

        pinPositionPct: pinPct,
        currentSlotIndex: currentSlotIndex,
      });
    },

    initTimeline() {
      const timeToSeconds = (timeStr: string) => {
        const [h, m] = timeStr.split(':');
        return parseInt(h) * 3600 + parseInt(m) * 60;
      };

      const totalStartSec = timeToSeconds('04:00');
      const totalEndSec = timeToSeconds('20:00');
      const totalDuration = totalEndSec - totalStartSec;

      const timelineSlots = RAW_SLOTS.map(slot => {
        const startSec = timeToSeconds(slot.startStr);
        const endSec = timeToSeconds(slot.endStr);
        const duration = endSec - startSec;

        return {
          ...slot,
          startSec,
          endSec,
          duration,
          widthPct: (duration / totalDuration) * 100
        };
      });

      this.setData({ timelineSlots });
    },

    onTapAllHolidays() {
      this.setData({ showCalendar: true });
    },
    closeCalendar() {
      this.setData({ showCalendar: false });
    },

    startClock() {
      this.updateLocalTime();
      timer = setInterval(() => {
        this.updateLocalTime();
      }, 1000) as unknown as number;
    },

    stopClock() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
  },

  // Life cycle
  lifetimes: {
    attached() {
      this.initTimeline();
      this.startClock();
    },
    detached() {
      this.stopClock();
    }
  },

  // For the processing of the mini program entering the
  // background/foreground under certain specific circumstances
  pageLifetimes: {
    show() {
      // If returning from another page,
      // make sure the clock is still running
      if (!timer) this.startClock();
    },
    hide() {
      // When you switch to the background,
      // you can pause the clock to save power
      this.stopClock();
    }
  }
})