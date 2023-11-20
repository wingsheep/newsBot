import axios from 'axios'
import type {Calendar, Weather, HistoryList, Sentence, Poem, Phrase, NewsList} from './types'

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
function calculateElapsedTimePercentageThisYear(length = 30) {
  // 获取当前时间
  const currentTime = new Date()
  // 获取今年的开始时间（1月1日的凌晨）
  const startOfYear = new Date(currentTime.getFullYear(), 0, 1)
  // 计算时间差（单位：毫秒）
  const elapsedTime = currentTime.valueOf() - startOfYear.valueOf()
  // 获取今年的总时间（考虑闰年）
  const totalYearTime = isLeapYear(currentTime.getFullYear()) ? 366 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000
  // 计算百分比
  const percentage = (elapsedTime / totalYearTime) * 100
  const hasPass = Math.floor(percentage * length / 100)
  const hasNotPass = length - hasPass
  const progressBar =  `<font color="#666">${'█'.repeat(hasPass)}</font><font color="comment">${'█'.repeat(hasNotPass)}</font>`
  return {
    percentage: percentage.toFixed(2) + '%',
    hasPass,
    hasNotPass,
    progressBar,
    year: currentTime.getFullYear(),
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
  markdown += `${data.progress.year}年，您已经使用了${data.progress.percentage} 🌹珍惜当下，享受此刻的美好!🌹 `
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
  const progress = calculateElapsedTimePercentageThisYear(14)

  if (data) {
    await sendMessage({
      ...data,
      progress,
    }, webhookUrl); 
    console.log('消息推送成功')
  }
}

main()
