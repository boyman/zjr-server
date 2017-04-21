# ZJR 服务端

本项目是基于[腾讯云微信小程序服务端 SDK - Node.js](https://github.com/tencentyun/wafer-node-server-sdk)和[Wafer 服务端 Demo - Node.js](https://github.com/tencentyun/wafer-node-server-demo)开发的服务端。

## 运行

按照[微信小程序创建资源配置指引](https://github.com/tencentyun/weapp-doc)进行操作，可以得到运行本项目所需的资源和服务，其中包括已部署好的代码及自动下发的 SDK 配置文件 `/etc/qcloud/sdk.config`。

- 项目代码部署目录：`/data/app/zjr-server`
- Node 版本：`v4.6.0`
- Node 进程管理工具：`pm2`

## 项目结构

```
zjr-server
├── README.md
├── app.js
├── business
│   └── chat-tunnel-handler.js
├── config.js
├── globals.js
├── package.json
├── process.json
├── routes
│   ├── index.js
│   ├── welcome.js
│   ├── login.js
│   ├── user.js
│   └── tunnel.js
└── setup-qcloud-sdk.js
```

其中，`app.js` 是 启动文件，`config.js` 配置了启动服务监听的端口号，`process.json` 是运行本示例 的 `pm2` 配置文件。

`setup-qcloud-sdk.js` 用于初始化 SDK 配置，配置从文件 `/etc/qcloud/sdk.config` 中读取。 配置文件包含如下配置项：

```json
{
    "serverHost": "业务服务器的主机名",
    "authServerUrl": "鉴权服务器地址",
    "tunnelServerUrl": "信道服务器地址",
    "tunnelSignatureKey": "和信道服务器通信的签名密钥"
}
```

## 更新 SDK 版本

进入目录 `/data/app/zjr-server`，然后先后执行命令 `npm update`、`pm2 restart process.json` 即可。
