export interface Root {
  code: number
  data: Data
  message: string
}

export interface Data {
  _intro: string
  calendar: Calendar
  historyList: HistoryList[]
  newsList: NewsList[]
  phrase: Phrase
  sentence: Sentence
  poem: Poem
  weather: Weather
  deadline: boolean
  code: string
  swiperList: SwiperList[]
}

export interface Calendar {
  lYear: number
  lMonth: number
  lDay: number
  animal: string
  yearCn: string
  monthCn: string
  dayCn: string
  cYear: number
  cMonth: number
  cDay: number
  gzYear: string
  gzMonth: string
  gzDay: string
  isToday: boolean
  isLeap: boolean
  nWeek: number
  ncWeek: string
  isTerm: boolean
  term: string
}

export interface HistoryList {
  event: string
  eventUrl?: string
}

export interface NewsList {
  title: string
  url: string
  category: string
}

export interface Phrase {
  phrase: string
  explain: string
  from: string
  example: string
  simple: string
  pinyin: string
}

export interface Sentence {
  wrong: boolean
  author: string
  sentence: string
}

export interface Poem {
  content: string[]
  type: string
  title: string
  author: string
}

export interface Weather {
  city: string
  weatherOf: string
  detail: Detail
}

export interface Detail {
  date: string
  text_day: string
  code_day: string
  text_night: string
  code_night: string
  high: string
  low: string
  rainfall: string
  precip: string
  wind_direction: string
  wind_direction_degree: string
  wind_speed: string
  wind_scale: string
  humidity: string
}

export interface SwiperList {
  name: string
  url: string
  thumbUrl: string
}
