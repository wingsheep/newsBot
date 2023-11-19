# 企业微信群聊天-每日简报推送脚本

部署vercel serverless

## Configuration
`process.env.NEWS_WECHAT_WEBHOOK_URL` 企业微信群机器人地址，也是用于此vercel serverless接口鉴权
```sh
export NEWS_WECHAT_WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=examplekey'"
```

## Installation
```sh
pnpm install -g vercel
pnpm install
```

## Development
```sh
vercel dev
```

## Production
```sh
vercel deploy --prod
```

## Usage

```sh
curl --location --request GET 'https://example.vercel.app/api/index' \
--header 'Authorization: Bearer https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=examplekey' \

```
## Screenshot
![](https://cdn.jsdelivr.net/gh/wingsheep/FigureBed@master/img/news_bot.png)
