# 企业微信群聊天-每日简报推送脚本

>  fork后配置群机器人地址secrets.NEWS_WECHAT_WEBHOOK_URL即可，默认明天9点执行，可修改main.yml cron 自定义定时执行，东八区减8小时

## Configuration
`process.env.NEWS_WECHAT_WEBHOOK_URL` 企业微信群机器人地址
```sh
export NEWS_WECHAT_WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=examplekey'"
```

## Installation
```sh
pnpm install
```

## Development
```sh
pnpm start
```

## Production

## Usage

## Screenshot
![](https://cdn.jsdelivr.net/gh/wingsheep/FigureBed@master/img/news_bot.png)
