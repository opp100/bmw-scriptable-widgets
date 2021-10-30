#bmw-scriptable-widgets

# 介绍
本软件是基于Scriptable开发的一个小组件。并且使用小件件作为开发框架而搭建。
主要用于从My BMW获取车辆相关信息并以小组件的形式展示到iOS设备上。

### 「小件件」开发框架
> iOS 小组件快速开发框架 / 模板 / 小组件源码  👉 for [Scriptable](https://scriptable.app)    
> 「小件件」开发框架[「小件件」开发框架](https://github.com/im3x/Scriptables)


# 发布

开发测试完毕后，可以 `pull` 到本分支进行开源分享    
小组件源码存放在 [Scrips](Scripts) 目录，你也可以复制其他的小组件进行修改使用。    


**打包分享**： 你可以使用如下命令，打包你的小组件成一个单独的文件，从而可以分享给其他用户使用：
``` bash
$ node pack.js Scripts/「源码」你的小组件.js
```
> 将会生成在 `Dist` 目录

**压缩代码**：打包的文件过大，如果需要压缩减少体积、加密敏感信息，可以通过如下脚本处理打包后的文件：
``` bash
$ node encode.js Dist/「小件件」你的小组件.js
```
> 将会在 `Dist` 目录生成 `「小件件」你的小组件.enc.js` 文件    
> 该脚本需要`javascript-obfuscator`库，如未安装请先在项目目录 `npm install`


微信小程序「小件件」 后续会开放开发者中心，开发者到时候可以上传、发布、出售自己的原创小组件。    
目前测试中，敬请关注！    

开发讨论交流群：https://x.im3x.cn/images/qun1.jpeg


![](https://x.im3x.cn/images/qr2.png)
