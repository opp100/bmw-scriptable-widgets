# bmw-scriptable-widgets

## 介绍
本程序是基于Scriptable开发的一个小组件。使用「小件件」作为开发框架而搭建。

主要用于从My BMW API中获取车辆相关信息并以小组件的形式展示到iOS设备上。

More languages: [English](README.en-us.md).

## 小组件效果
!["效果图"](/screenshots/sc_1.png?raw=true)

## 如何开发
*开发需要nodejs环境，建议使用 [nvm](https://github.com/nvm-sh/nvm) 搭建node环境。

*建议使用[VSCode](https://code.visualstudio.com/)作为IDE来开发此程序

在终端中运行以下命令
```bash
npm install
npm start
```
然后根据Console的提示来

*如果IP不正确，可以添加一个`.env`文件，然后放入电脑的IP和端口
```
DEV_SERVER=192.168.1.123
```

## 「小件件」开发框架
> iOS 小组件快速开发框架 / 模板 / 小组件源码  👉 for [Scriptable](https://scriptable.app)    
> 「小件件」开发框架[「小件件」开发框架](https://github.com/im3x/Scriptables)


### 特别鸣谢
感谢POPO大佬帮助UI建设。

感谢胡总、吹雪、沙包、以及部分群友，提供思路帮助与测试

### License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)