# bmw-scriptable-widgets

## What's this about?
This project is a pure Node JS widget which can be used on [Scriptable](https://scriptable.app).

The main purpose is the load data from My BMW API and get related information, then display it into the desktop of iOS ( > 13) devices.

其他语言版本: [中文](README.md).

## Screenshots
!["Screenshot"](/screenshots/sc_1.png?raw=true)

## How to Develop
* NodeJS is required，recommend using  [nvm](https://github.com/nvm-sh/nvm) to setup Node environment easily.

Run following command in you Terminal
```bash
npm install
npm start
```
Then follow the instruction shown in the Console

*If the IP address doesn't setup correctly, please put the `.env` file in the root of project and put your computer's IP address. Such as:
```
DEV_SERVER=192.168.1.123
```

### Contributors
Thanks POPO provides UI。

Thanks for Mr. Hu, Mr.Chui and Mr.Shabao provide ideas and API logics.

Thanks many other bimmwer owners give us feedback suggestions and help with test.

### License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)