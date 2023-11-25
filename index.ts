import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type {Calendar, Weather, HistoryList, Sentence, Poem, Phrase, NewsList} from './types'

dayjs.extend(utc)
dayjs.extend(timezone)

// 日期
function convertDateStatement(calendar: Calendar): string {
  const { animal, monthCn, dayCn, cMonth, cDay, ncWeek, term } = calendar
  return `${cMonth}月${cDay}号${ncWeek}，农历${animal}年${monthCn}${dayCn}${term ? `，${term}` : ''}，祝您生活愉快，平安喜乐`
}
// 天气
function convertWeatherStatement(weather: Weather): string {
  const { city, weatherOf, detail: { text_day, text_night, low, high, wind_direction, wind_scale } } = weather
  return `${weatherOf === 'tommorrow' ? '明日' : '今日' }${city}${text_day}${text_day === text_night ? '' : '转' + text_night}，${low} ~ ${high}℃，${wind_direction}${wind_scale}级`
}
// 历史上的今天
function convertHistoryList(historyList: HistoryList[]):  HistoryList[] {
  return historyList
    .map((item) => {
      return {
        ...item,
        eventUrl: `https://cn.bing.com/search?q=${item.event}`,
      }
    })
}
// 成语
function convertPhrase(phrase: Phrase): Phrase {
  const phraseStatement = phrase.pinyin.split(' ').map(((item: string, index: number) => `<font color="red">${ phrase.phrase[index]}</font>(${item})`)).join('·')
  return {
    ...phrase,
    phrase: phraseStatement,
  }
}
async function getNews() {
  const {data: {code, data}} = await axios.get(
    'https://news.topurl.cn/api?ip=112.20.118.37&count=10'
  )
  if (code === 200) {
    const weatherStatement = convertWeatherStatement(data.weather)
    const dateStatement = convertDateStatement(data.calendar)
    const historyList = convertHistoryList(data.historyList)
    const phrase = convertPhrase(data.phrase) 
    return {
      ...data,
      weatherStatement,
      dateStatement,
      phrase,
      historyList,
      newsList: data.newsList as NewsList[],
      poem: data.poem as Poem,
      sentence: data.sentence as Sentence,
    }
  }
}

// 判断是否是闰年
function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
// 计算今年过去了多少百分比
function calculateElapsedTimePercentageThisYear(length = 30, nextHolidayDate?: string) {
  // 获取当前时间
  const currentTime = new Date()
  // 获取今年的开始时间（1月1日的凌晨）
  const startOfYear = dayjs().startOf('year')
  // 节假日
  const holidayDay = nextHolidayDate && dayjs(nextHolidayDate)
  // 计算时间差（单位：毫秒）
  const elapsedTime = currentTime.valueOf() - startOfYear.valueOf()
  // 获取今年的总时间（考虑闰年）
  const totalYearTime = isLeapYear(currentTime.getFullYear()) ? 366 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000
  // 计算百分比
  const percentage = (elapsedTime / totalYearTime) * 100
  const hasPass = Math.floor(percentage * length / 100)
  const hasNotPass = length - hasPass

  // 计算节假日时间差
  const holidayDayElapsedTime = holidayDay && holidayDay.valueOf() - startOfYear.valueOf()
  const holidayDayPercentage = holidayDayElapsedTime && (holidayDayElapsedTime / totalYearTime) * 100
  let holidayDayHasPass = holidayDayPercentage && Math.floor(holidayDayPercentage * length / 100)
  holidayDayHasPass = holidayDayHasPass && holidayDayHasPass > length  ? length : holidayDayHasPass as number
  const hasNotPassStr = '-'.repeat(hasNotPass)
  const holidayLength = length - holidayDayHasPass
  const modifiedStr = hasNotPassStr.substring(0, hasNotPassStr.length - holidayLength) + '<font color="red">-</font>' + hasNotPassStr.substring(hasNotPassStr.length - holidayLength + 1)
  const progressBar =`<font color="gray">| ${'#'.repeat(hasPass)}${modifiedStr} | ${percentage.toFixed(2) + '%'}</font>` 
  return {
    percentage: percentage.toFixed(2) + '%',
    hasPass,
    hasNotPass,
    progressBar,
    year: currentTime.getFullYear(),
  }
}
// 获取下一个节假日
async function getNextHoliday() {
  const {data} = await axios.get(
    'https://date.appworlds.cn/next'
  )
  return {
    ... data.data,
    nextHolidayDate: data.data.date
  } as {
    holiday: boolean,
    name: string,
    nextHolidayDate: string
  }
}
// 获取距离下一个节假日剩余天数
async function getnextDays() {
  const {data} = await axios.get(
    'https://date.appworlds.cn/next/days'
  )
  return data.data
}

// 获取明天是否是工作日
async function getWorkTomorrow() {
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  const goodSentenceMap: any = {
    1: "祝你度过一个愉快的休息日，充分放松并享受美好时光！",
    2: "希望你在休息日能够尽情放松，充电，恢复精力，为新的一周做好准备！",
    3: "愿你的休息日充满欢乐和快乐，让所有的压力和疲劳都远离你！",
    4: "祝你度过一个美好的休息日，与家人朋友共度时光，留下美好的回忆！",
    5: "希望你的休息日充满阳光和喜悦，每一刻都充满快乐和满足！",
    6: "愿你的休息日充满美丽和宁静，让你的心灵得到滋养和放松！",
    7: "在这个休息日里，希望你能够享受美食、阅读好书、做你喜欢的事情，尽情放松！",
    8: "希望你的休息日充满惊喜和乐趣，让你的心情变得更加愉快！",
    9: "祝你度过一个悠闲而惬意的休息日，远离工作的烦恼，享受自由自在的时光！",
    10: "希望你的休息日充满美好的事物，像阳光一样温暖你的心灵！",
    11: "愿你的休息日充满美梦和好运，让你在新的一周中充满动力和能量！",
    12: "祝你度过一个充满活力和活动的休息日，让你的身心都得到放松和恢复！",
    13: "希望你在休息日能够找到内心的宁静和平衡，让自己重拾活力和动力！",
    14: "愿你的休息日充满欢笑和快乐，让每一刻都值得回味和珍藏！",
  }
  try {   
    const { data: {code, data} } = await axios.get(
      `https://date.appworlds.cn/work?date=${tomorrow}`
    )
    if (code === 200) {
      return {
        isWorkTomorrow: data.work,
        greeting: goodSentenceMap[Math.floor(Math.random() * 14) + 1]
      }
    }
  } catch (error) {
    console.log(error)
  }
}
// 获取工作日天数
async function getWorkDays() {
  const startDate = dayjs().startOf('year').format('YYYY-MM-DD')
  const endDate = dayjs().format('YYYY-MM-DD')
  const { data: {code, data} } = await axios.get(
    `https://date.appworlds.cn/work/days?startDate=${startDate}&endDate=${endDate}`
  )
  if (code === 200) {
    return data
  }
}

// 获取节假日信息
async function getHolidayInfo() {
  // 免费用户接口访问频率为1次/秒!(appworlds.cn)
  const nextHoliday = await getNextHoliday()
  await new Promise(resolve => setTimeout(resolve, 600));
  const nextDays = await getnextDays()
  await new Promise(resolve => setTimeout(resolve, 600));
  const workTomorrow = await getWorkTomorrow()
  await new Promise(resolve => setTimeout(resolve, 600));
  const workDays = await getWorkDays()
  return {
    ...nextHoliday,
    nextDays,
    workDays,
    ...workTomorrow,
  }
}

async function sendMessage(data: {
  weatherStatement: string;
  dateStatement: string;
  historyList: HistoryList[];
  newsList: NewsList[];
  poem: Poem;
  phrase: Phrase;
  sentence: Sentence;
  holidayInfo: {
    name: string,
    holiday: boolean,
    nextDays: number,
    isWork: boolean
    isWorkTomorrow: boolean
    greeting: string
    workDays: number
  };
  progress: {
    percentage: string;
    hasNotPass: number;
    hasPass: number;
    progressBar: string;
    year: number;
  }
}, webhookUrl: string) {
  let markdown = '## <font color="warning">慧语简报</font>\n'
  markdown += `${data.dateStatement}\n`
  markdown += `${data.weatherStatement} [🌝](https://m.weather.com.cn/)\n`
  markdown += `\n`
  markdown += `> <font color="info">每日新闻</font>\n`
  data.newsList.forEach((item, index) => {
    markdown += `${index + 1}. ${item.title} [↗️](${item.url})\n`
  })
  markdown += `\n`
  markdown += `> <font color="info">历史上的今天</font>\n`
  data.historyList.forEach((item) => {
    markdown += `▪ ${item.event} [↗️](${item.eventUrl})\n`
  })
  markdown += `\n`
  markdown += `> <font color="info">天天诗词</font>\n`
  markdown += `《${data.poem.title}》 —— ${data.poem.author}\n`
  data.poem.content.forEach((item) => {
    markdown += `${item}\n`
  })
  markdown += `\n`
  markdown += `> <font color="info">天天成语</font> [🔡](https://handle.antfu.me/)\n`
  markdown += `${data.phrase.phrase}\n`
  markdown += data.phrase.explain && `释义：${data.phrase.explain}\n`
  markdown += data.phrase.from && `出处：${data.phrase.from}\n`
  markdown += data.phrase.example && `示例：${data.phrase.example}\n`
  markdown += `\n`
  markdown += `> <font color="info">慧语香风</font> \n`
  markdown += `${data.sentence.sentence}\n`
  markdown += `\n`
  markdown += `> <font color="info">进度条</font> \n`
  markdown += `${data.progress.progressBar}\n`
  markdown += `${data.progress.year}年，`
  markdown += `你已经工作了<font color="gray">${data.holidayInfo.workDays}</font>天，距离<font color="red">${data.holidayInfo.name}</font>还有<font color="red">${data.holidayInfo.nextDays}</font>天! \n`
  markdown += `\n`
  if (!data.holidayInfo.isWorkTomorrow) {
    markdown +=`> 明日休息, ${data.holidayInfo.greeting}\n`
  }
  markdown += `珍惜当下，享受此刻的美好!🌸`
  const content = {
    msgtype: "markdown",
    markdown: {
      "content": markdown
    },
  }

  webhookUrl && await axios.post(
    webhookUrl,
    content
  )
  return content
}

async function main() {
  // 获取命令行传入的参数
  const webhookUrl =  process.argv.splice(2)[0] || process.env.NEWS_WECHAT_WEBHOOK_URL
  if (!webhookUrl) {
    return console.error('请设置环境变量NEWS_WECHAT_WEBHOOK_URL: 企业微信群机器人地址');
  }  
  const data = await getNews();
  const holidayInfo = await getHolidayInfo()
  const progress = calculateElapsedTimePercentageThisYear(20, holidayInfo.nextHolidayDate)
  if (data) {
    await sendMessage({
      ...data,
      progress,
      holidayInfo,
    }, webhookUrl); 
    console.log('消息推送成功')
  }
}

main()

