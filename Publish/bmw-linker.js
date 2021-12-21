// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: comments;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: code-branch;
// 
// 「小件件」
// 开发环境，用于小组件调用
// https://x.im3x.cn
// https://github.com/im3x/Scriptables
// 

// 组件基础类
const RUNTIME_VERSION = 20201209

class Base {
  constructor (arg="") {
    this.arg = arg
    this._actions = {}
    this.init()
  }

  init (widgetFamily = config.widgetFamily) {
    // 组件大小：small,medium,large
    this.widgetFamily = widgetFamily
    // 系统设置的key，这里分为三个类型：
    // 1. 全局
    // 2. 不同尺寸的小组件
    // 3. 不同尺寸+小组件自定义的参数
    // 当没有key2时，获取key1，没有key1获取全局key的设置
    // this.SETTING_KEY = this.md5(Script.name()+'@'+this.widgetFamily+"@"+this.arg)
    // this.SETTING_KEY1 = this.md5(Script.name()+'@'+this.widgetFamily)
    this.SETTING_KEY = this.md5(Script.name())
    // 文件管理器
    // 提示：缓存数据不要用这个操作，这个是操作源码目录的，缓存建议存放在local temp目录中
    this.FILE_MGR = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']()
    // 本地，用于存储图片等
    this.FILE_MGR_LOCAL = FileManager.local()
    this.BACKGROUND_KEY = this.FILE_MGR_LOCAL.joinPath(this.FILE_MGR_LOCAL.documentsDirectory(), `bg_${this.SETTING_KEY}.jpg`)
    // this.BACKGROUND_KEY1 = this.FILE_MGR_LOCAL.joinPath(this.FILE_MGR_LOCAL.documentsDirectory(), `bg_${this.SETTING_KEY1}.jpg`)
    // this.BACKGROUND_KEY2 = this.FILE_MGR_LOCAL.joinPath(this.FILE_MGR_LOCAL.documentsDirectory(), `bg_${this.SETTING_KEY2}.jpg`)
    // // 插件设置
    this.settings = this.getSettings()
  }

  /**
   * 注册点击操作菜单
   * @param {string} name 操作函数名
   * @param {func} func 点击后执行的函数
   */
  registerAction (name, func) {
    this._actions[name] = func.bind(this)
  }

  /**
   * 生成操作回调URL，点击后执行本脚本，并触发相应操作
   * @param {string} name 操作的名称
   * @param {string} data 传递的数据
   */
  actionUrl (name = '', data = '') {
    let u = URLScheme.forRunningScript()
    let q = `act=${encodeURIComponent(name)}&data=${encodeURIComponent(data)}&__arg=${encodeURIComponent(this.arg)}&__size=${this.widgetFamily}`
    let result = ''
    if (u.includes('run?')) {
      result = `${u}&${q}`
    } else {
      result = `${u}?${q}`
    }
    return result
  }

  /**
   * base64 编码字符串
   * @param {string} str 要编码的字符串
   */
  base64Encode (str) {
    const data = Data.fromString(str)
    return data.toBase64String()
  }

  /**
   * base64解码数据 返回字符串
   * @param {string} b64 base64编码的数据
   */
  base64Decode (b64) {
    const data = Data.fromBase64String(b64)
    return data.toRawString()
  }

  /**
   * md5 加密字符串
   * @param {string} str 要加密成md5的数据
   */
  md5 (str) {
    function d(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function f(n,t,r,e,o,u){return d((c=d(d(t,n),d(e,u)))<<(f=o)|c>>>32-f,r);var c,f}function l(n,t,r,e,o,u,c){return f(t&r|~t&e,n,t,o,u,c)}function v(n,t,r,e,o,u,c){return f(t&e|r&~e,n,t,o,u,c)}function g(n,t,r,e,o,u,c){return f(t^r^e,n,t,o,u,c)}function m(n,t,r,e,o,u,c){return f(r^(t|~e),n,t,o,u,c)}function i(n,t){var r,e,o,u;n[t>>5]|=128<<t%32,n[14+(t+64>>>9<<4)]=t;for(var c=1732584193,f=-271733879,i=-1732584194,a=271733878,h=0;h<n.length;h+=16)c=l(r=c,e=f,o=i,u=a,n[h],7,-680876936),a=l(a,c,f,i,n[h+1],12,-389564586),i=l(i,a,c,f,n[h+2],17,606105819),f=l(f,i,a,c,n[h+3],22,-1044525330),c=l(c,f,i,a,n[h+4],7,-176418897),a=l(a,c,f,i,n[h+5],12,1200080426),i=l(i,a,c,f,n[h+6],17,-1473231341),f=l(f,i,a,c,n[h+7],22,-45705983),c=l(c,f,i,a,n[h+8],7,1770035416),a=l(a,c,f,i,n[h+9],12,-1958414417),i=l(i,a,c,f,n[h+10],17,-42063),f=l(f,i,a,c,n[h+11],22,-1990404162),c=l(c,f,i,a,n[h+12],7,1804603682),a=l(a,c,f,i,n[h+13],12,-40341101),i=l(i,a,c,f,n[h+14],17,-1502002290),c=v(c,f=l(f,i,a,c,n[h+15],22,1236535329),i,a,n[h+1],5,-165796510),a=v(a,c,f,i,n[h+6],9,-1069501632),i=v(i,a,c,f,n[h+11],14,643717713),f=v(f,i,a,c,n[h],20,-373897302),c=v(c,f,i,a,n[h+5],5,-701558691),a=v(a,c,f,i,n[h+10],9,38016083),i=v(i,a,c,f,n[h+15],14,-660478335),f=v(f,i,a,c,n[h+4],20,-405537848),c=v(c,f,i,a,n[h+9],5,568446438),a=v(a,c,f,i,n[h+14],9,-1019803690),i=v(i,a,c,f,n[h+3],14,-187363961),f=v(f,i,a,c,n[h+8],20,1163531501),c=v(c,f,i,a,n[h+13],5,-1444681467),a=v(a,c,f,i,n[h+2],9,-51403784),i=v(i,a,c,f,n[h+7],14,1735328473),c=g(c,f=v(f,i,a,c,n[h+12],20,-1926607734),i,a,n[h+5],4,-378558),a=g(a,c,f,i,n[h+8],11,-2022574463),i=g(i,a,c,f,n[h+11],16,1839030562),f=g(f,i,a,c,n[h+14],23,-35309556),c=g(c,f,i,a,n[h+1],4,-1530992060),a=g(a,c,f,i,n[h+4],11,1272893353),i=g(i,a,c,f,n[h+7],16,-155497632),f=g(f,i,a,c,n[h+10],23,-1094730640),c=g(c,f,i,a,n[h+13],4,681279174),a=g(a,c,f,i,n[h],11,-358537222),i=g(i,a,c,f,n[h+3],16,-722521979),f=g(f,i,a,c,n[h+6],23,76029189),c=g(c,f,i,a,n[h+9],4,-640364487),a=g(a,c,f,i,n[h+12],11,-421815835),i=g(i,a,c,f,n[h+15],16,530742520),c=m(c,f=g(f,i,a,c,n[h+2],23,-995338651),i,a,n[h],6,-198630844),a=m(a,c,f,i,n[h+7],10,1126891415),i=m(i,a,c,f,n[h+14],15,-1416354905),f=m(f,i,a,c,n[h+5],21,-57434055),c=m(c,f,i,a,n[h+12],6,1700485571),a=m(a,c,f,i,n[h+3],10,-1894986606),i=m(i,a,c,f,n[h+10],15,-1051523),f=m(f,i,a,c,n[h+1],21,-2054922799),c=m(c,f,i,a,n[h+8],6,1873313359),a=m(a,c,f,i,n[h+15],10,-30611744),i=m(i,a,c,f,n[h+6],15,-1560198380),f=m(f,i,a,c,n[h+13],21,1309151649),c=m(c,f,i,a,n[h+4],6,-145523070),a=m(a,c,f,i,n[h+11],10,-1120210379),i=m(i,a,c,f,n[h+2],15,718787259),f=m(f,i,a,c,n[h+9],21,-343485551),c=d(c,r),f=d(f,e),i=d(i,o),a=d(a,u);return[c,f,i,a]}function a(n){for(var t="",r=32*n.length,e=0;e<r;e+=8)t+=String.fromCharCode(n[e>>5]>>>e%32&255);return t}function h(n){var t=[];for(t[(n.length>>2)-1]=void 0,e=0;e<t.length;e+=1)t[e]=0;for(var r=8*n.length,e=0;e<r;e+=8)t[e>>5]|=(255&n.charCodeAt(e/8))<<e%32;return t}function e(n){for(var t,r="0123456789abcdef",e="",o=0;o<n.length;o+=1)t=n.charCodeAt(o),e+=r.charAt(t>>>4&15)+r.charAt(15&t);return e}function r(n){return unescape(encodeURIComponent(n))}function o(n){return a(i(h(t=r(n)),8*t.length));var t}function u(n,t){return function(n,t){var r,e,o=h(n),u=[],c=[];for(u[15]=c[15]=void 0,16<o.length&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(h(t)),512+8*t.length),a(i(c.concat(e),640))}(r(n),r(t))}function t(n,t,r){return t?r?u(t,n):e(u(t,n)):r?o(n):e(o(n))}
    return t(str)
  }


  /**
   * HTTP 请求接口
   * @param {string} url 请求的url
   * @param {bool} json 返回数据是否为 json，默认 true
   * @param {bool} useCache 是否采用离线缓存（请求失败后获取上一次结果），
   * @return {string | json | null}
   */
  async httpGet (url, json = true, useCache = false) {
    let data = null
    const cacheKey = this.md5(url)
    if (useCache && Keychain.contains(cacheKey)) {
      let cache = Keychain.get(cacheKey)
      return json ? JSON.parse(cache) : cache
    }
    try {
      let req = new Request(url)
      data = await (json ? req.loadJSON() : req.loadString())
    } catch (e) {}
    // 判断数据是否为空（加载失败）
    if (!data && Keychain.contains(cacheKey)) {
      // 判断是否有缓存
      let cache = Keychain.get(cacheKey)
      return json ? JSON.parse(cache) : cache
    }
    // 存储缓存
    Keychain.set(cacheKey, json ? JSON.stringify(data) : data)
    return data
  }

  async httpPost (url, data) {}

  /**
   * 获取远程图片内容
   * @param {string} url 图片地址
   * @param {bool} useCache 是否使用缓存（请求失败时获取本地缓存）
   */
  async getImageByUrl (url, useCache = true) {
    const cacheKey = this.md5(url)
    const cacheFile = FileManager.local().joinPath(FileManager.local().temporaryDirectory(), cacheKey)
    // 判断是否有缓存
    if (useCache && FileManager.local().fileExists(cacheFile)) {
      return Image.fromFile(cacheFile)
    }
    try {
      const req = new Request(url)
      const img = await req.loadImage()
      // 存储到缓存
      FileManager.local().writeImage(cacheFile, img)
      return img
    } catch (e) {
      // 没有缓存+失败情况下，返回自定义的绘制图片（红色背景）
        throw new Error('加载图片失败');
    }
  }

  /**
   * 渲染标题内容
   * @param {object} widget 组件对象
   * @param {string} icon 图标地址
   * @param {string} title 标题内容
   * @param {bool|color} color 字体的颜色（自定义背景时使用，默认系统）
   */
  async renderHeader (widget, icon, title, color = false) {
    widget.addSpacer(10)
    let header = widget.addStack()
    header.centerAlignContent()
    let _icon = header.addImage(await this.getImageByUrl(icon))
    _icon.imageSize = new Size(14, 14)
    _icon.cornerRadius = 4
    header.addSpacer(10)
    let _title = header.addText(title)
    if (color) _title.textColor = color
    _title.textOpacity = 0.7
    _title.font = Font.boldSystemFont(12)
    widget.addSpacer(10)
    return widget
  }

  /**
   * 获取截图中的组件剪裁图
   * 可用作透明背景
   * 返回图片image对象
   * 代码改自：https://gist.github.com/mzeryck/3a97ccd1e059b3afa3c6666d27a496c9
   * @param {string} title 开始处理前提示用户截图的信息，可选（适合用在组件自定义透明背景时提示）
   */
  async getWidgetScreenShot (title = null) {
    // Generate an alert with the provided array of options.
    async function generateAlert(message,options) {
      
      let alert = new Alert()
      alert.message = message
      
      for (const option of options) {
        alert.addAction(option)
      }
      
      let response = await alert.presentAlert()
      return response
    }

    // Crop an image into the specified rect.
    function cropImage(img,rect) {
      
      let draw = new DrawContext()
      draw.size = new Size(rect.width, rect.height)
      
      draw.drawImageAtPoint(img,new Point(-rect.x, -rect.y))  
      return draw.getImage()
    }

    async function blurImage(img,style) {
      const blur = 150
      const js = `
var mul_table=[512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];var shg_table=[9,11,12,13,13,14,14,15,15,15,15,16,16,16,16,17,17,17,17,17,17,17,18,18,18,18,18,18,18,18,18,19,19,19,19,19,19,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24];function stackBlurCanvasRGB(id,top_x,top_y,width,height,radius){if(isNaN(radius)||radius<1)return;radius|=0;var canvas=document.getElementById(id);var context=canvas.getContext("2d");var imageData;try{try{imageData=context.getImageData(top_x,top_y,width,height)}catch(e){try{netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");imageData=context.getImageData(top_x,top_y,width,height)}catch(e){alert("Cannot access local image");throw new Error("unable to access local image data: "+e);return}}}catch(e){alert("Cannot access image");throw new Error("unable to access image data: "+e);}var pixels=imageData.data;var x,y,i,p,yp,yi,yw,r_sum,g_sum,b_sum,r_out_sum,g_out_sum,b_out_sum,r_in_sum,g_in_sum,b_in_sum,pr,pg,pb,rbs;var div=radius+radius+1;var w4=width<<2;var widthMinus1=width-1;var heightMinus1=height-1;var radiusPlus1=radius+1;var sumFactor=radiusPlus1*(radiusPlus1+1)/2;var stackStart=new BlurStack();var stack=stackStart;for(i=1;i<div;i++){stack=stack.next=new BlurStack();if(i==radiusPlus1)var stackEnd=stack}stack.next=stackStart;var stackIn=null;var stackOut=null;yw=yi=0;var mul_sum=mul_table[radius];var shg_sum=shg_table[radius];for(y=0;y<height;y++){r_in_sum=g_in_sum=b_in_sum=r_sum=g_sum=b_sum=0;r_out_sum=radiusPlus1*(pr=pixels[yi]);g_out_sum=radiusPlus1*(pg=pixels[yi+1]);b_out_sum=radiusPlus1*(pb=pixels[yi+2]);r_sum+=sumFactor*pr;g_sum+=sumFactor*pg;b_sum+=sumFactor*pb;stack=stackStart;for(i=0;i<radiusPlus1;i++){stack.r=pr;stack.g=pg;stack.b=pb;stack=stack.next}for(i=1;i<radiusPlus1;i++){p=yi+((widthMinus1<i?widthMinus1:i)<<2);r_sum+=(stack.r=(pr=pixels[p]))*(rbs=radiusPlus1-i);g_sum+=(stack.g=(pg=pixels[p+1]))*rbs;b_sum+=(stack.b=(pb=pixels[p+2]))*rbs;r_in_sum+=pr;g_in_sum+=pg;b_in_sum+=pb;stack=stack.next}stackIn=stackStart;stackOut=stackEnd;for(x=0;x<width;x++){pixels[yi]=(r_sum*mul_sum)>>shg_sum;pixels[yi+1]=(g_sum*mul_sum)>>shg_sum;pixels[yi+2]=(b_sum*mul_sum)>>shg_sum;r_sum-=r_out_sum;g_sum-=g_out_sum;b_sum-=b_out_sum;r_out_sum-=stackIn.r;g_out_sum-=stackIn.g;b_out_sum-=stackIn.b;p=(yw+((p=x+radius+1)<widthMinus1?p:widthMinus1))<<2;r_in_sum+=(stackIn.r=pixels[p]);g_in_sum+=(stackIn.g=pixels[p+1]);b_in_sum+=(stackIn.b=pixels[p+2]);r_sum+=r_in_sum;g_sum+=g_in_sum;b_sum+=b_in_sum;stackIn=stackIn.next;r_out_sum+=(pr=stackOut.r);g_out_sum+=(pg=stackOut.g);b_out_sum+=(pb=stackOut.b);r_in_sum-=pr;g_in_sum-=pg;b_in_sum-=pb;stackOut=stackOut.next;yi+=4}yw+=width}for(x=0;x<width;x++){g_in_sum=b_in_sum=r_in_sum=g_sum=b_sum=r_sum=0;yi=x<<2;r_out_sum=radiusPlus1*(pr=pixels[yi]);g_out_sum=radiusPlus1*(pg=pixels[yi+1]);b_out_sum=radiusPlus1*(pb=pixels[yi+2]);r_sum+=sumFactor*pr;g_sum+=sumFactor*pg;b_sum+=sumFactor*pb;stack=stackStart;for(i=0;i<radiusPlus1;i++){stack.r=pr;stack.g=pg;stack.b=pb;stack=stack.next}yp=width;for(i=1;i<=radius;i++){yi=(yp+x)<<2;r_sum+=(stack.r=(pr=pixels[yi]))*(rbs=radiusPlus1-i);g_sum+=(stack.g=(pg=pixels[yi+1]))*rbs;b_sum+=(stack.b=(pb=pixels[yi+2]))*rbs;r_in_sum+=pr;g_in_sum+=pg;b_in_sum+=pb;stack=stack.next;if(i<heightMinus1){yp+=width}}yi=x;stackIn=stackStart;stackOut=stackEnd;for(y=0;y<height;y++){p=yi<<2;pixels[p]=(r_sum*mul_sum)>>shg_sum;pixels[p+1]=(g_sum*mul_sum)>>shg_sum;pixels[p+2]=(b_sum*mul_sum)>>shg_sum;r_sum-=r_out_sum;g_sum-=g_out_sum;b_sum-=b_out_sum;r_out_sum-=stackIn.r;g_out_sum-=stackIn.g;b_out_sum-=stackIn.b;p=(x+(((p=y+radiusPlus1)<heightMinus1?p:heightMinus1)*width))<<2;r_sum+=(r_in_sum+=(stackIn.r=pixels[p]));g_sum+=(g_in_sum+=(stackIn.g=pixels[p+1]));b_sum+=(b_in_sum+=(stackIn.b=pixels[p+2]));stackIn=stackIn.next;r_out_sum+=(pr=stackOut.r);g_out_sum+=(pg=stackOut.g);b_out_sum+=(pb=stackOut.b);r_in_sum-=pr;g_in_sum-=pg;b_in_sum-=pb;stackOut=stackOut.next;yi+=width}}context.putImageData(imageData,top_x,top_y)}function BlurStack(){this.r=0;this.g=0;this.b=0;this.a=0;this.next=null}
      // https://gist.github.com/mjackson/5311256
    
      function rgbToHsl(r, g, b){
          r /= 255, g /= 255, b /= 255;
          var max = Math.max(r, g, b), min = Math.min(r, g, b);
          var h, s, l = (max + min) / 2;
    
          if(max == min){
              h = s = 0; // achromatic
          }else{
              var d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              switch(max){
                  case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                  case g: h = (b - r) / d + 2; break;
                  case b: h = (r - g) / d + 4; break;
              }
              h /= 6;
          }
    
          return [h, s, l];
      }
    
      function hslToRgb(h, s, l){
          var r, g, b;
    
          if(s == 0){
              r = g = b = l; // achromatic
          }else{
              var hue2rgb = function hue2rgb(p, q, t){
                  if(t < 0) t += 1;
                  if(t > 1) t -= 1;
                  if(t < 1/6) return p + (q - p) * 6 * t;
                  if(t < 1/2) return q;
                  if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                  return p;
              }
    
              var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
              var p = 2 * l - q;
              r = hue2rgb(p, q, h + 1/3);
              g = hue2rgb(p, q, h);
              b = hue2rgb(p, q, h - 1/3);
          }
    
          return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
      }
      
      function lightBlur(hsl) {
      
        // Adjust the luminance.
        let lumCalc = 0.35 + (0.3 / hsl[2]);
        if (lumCalc < 1) { lumCalc = 1; }
        else if (lumCalc > 3.3) { lumCalc = 3.3; }
        const l = hsl[2] * lumCalc;
        
        // Adjust the saturation. 
        const colorful = 2 * hsl[1] * l;
        const s = hsl[1] * colorful * 1.5;
        
        return [hsl[0],s,l];
        
      }
      
      function darkBlur(hsl) {
    
        // Adjust the saturation. 
        const colorful = 2 * hsl[1] * hsl[2];
        const s = hsl[1] * (1 - hsl[2]) * 3;
        
        return [hsl[0],s,hsl[2]];
        
      }
    
      // Set up the canvas.
      const img = document.getElementById("blurImg");
      const canvas = document.getElementById("mainCanvas");
    
      const w = img.naturalWidth;
      const h = img.naturalHeight;
    
      canvas.style.width  = w + "px";
      canvas.style.height = h + "px";
      canvas.width = w;
      canvas.height = h;
    
      const context = canvas.getContext("2d");
      context.clearRect( 0, 0, w, h );
      context.drawImage( img, 0, 0 );
      
      // Get the image data from the context.
      var imageData = context.getImageData(0,0,w,h);
      var pix = imageData.data;
      
      var isDark = "${style}" == "dark";
      var imageFunc = isDark ? darkBlur : lightBlur;
    
      for (let i=0; i < pix.length; i+=4) {
    
        // Convert to HSL.
        let hsl = rgbToHsl(pix[i],pix[i+1],pix[i+2]);
        
        // Apply the image function.
        hsl = imageFunc(hsl);
      
        // Convert back to RGB.
        const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
      
        // Put the values back into the data.
        pix[i] = rgb[0];
        pix[i+1] = rgb[1];
        pix[i+2] = rgb[2];
    
      }
    
      // Draw over the old image.
      context.putImageData(imageData,0,0);
    
      // Blur the image.
      stackBlurCanvasRGB("mainCanvas", 0, 0, w, h, ${blur});
      
      // Perform the additional processing for dark images.
      if (isDark) {
      
        // Draw the hard light box over it.
        context.globalCompositeOperation = "hard-light";
        context.fillStyle = "rgba(55,55,55,0.2)";
        context.fillRect(0, 0, w, h);
    
        // Draw the soft light box over it.
        context.globalCompositeOperation = "soft-light";
        context.fillStyle = "rgba(55,55,55,1)";
        context.fillRect(0, 0, w, h);
    
        // Draw the regular box over it.
        context.globalCompositeOperation = "source-over";
        context.fillStyle = "rgba(55,55,55,0.4)";
        context.fillRect(0, 0, w, h);
      
      // Otherwise process light images.
      } else {
        context.fillStyle = "rgba(255,255,255,0.4)";
        context.fillRect(0, 0, w, h);
      }
    
      // Return a base64 representation.
      canvas.toDataURL(); 
      `
      
      // Convert the images and create the HTML.
      let blurImgData = Data.fromPNG(img).toBase64String()
      let html = `
      <img id="blurImg" src="data:image/png;base64,${blurImgData}" />
      <canvas id="mainCanvas" />
      `
      
      // Make the web view and get its return value.
      let view = new WebView()
      await view.loadHTML(html)
      let returnValue = await view.evaluateJavaScript(js)
      
      // Remove the data type from the string and convert to data.
      let imageDataString = returnValue.slice(22)
      let imageData = Data.fromBase64String(imageDataString)
      
      // Convert to image and crop before returning.
      let imageFromData = Image.fromData(imageData)
      // return cropImage(imageFromData)
      return imageFromData
    }


    // Pixel sizes and positions for widgets on all supported phones.
    function phoneSizes() {
      let phones = {
        // 12 and 12 Pro
        "2532": {
          small:  474,
          medium: 1014,
          large:  1062,
          left:  78,
          right: 618,
          top:    231,
          middle: 819,
          bottom: 1407
        },
      
        // 11 Pro Max, XS Max
        "2688": {
          small:  507,
          medium: 1080,
          large:  1137,
          left:  81,
          right: 654,
          top:    228,
          middle: 858,
          bottom: 1488
        },
      
        // 11, XR
        "1792": {
          small:  338,
          medium: 720,
          large:  758,
          left:  54,
          right: 436,
          top:    160,
          middle: 580,
          bottom: 1000
        },
        
        
        // 11 Pro, XS, X
        "2436": {
          small:  465,
          medium: 987,
          large:  1035,
          left:  69,
          right: 591,
          top:    213,
          middle: 783,
          bottom: 1353
        },
      
        // Plus phones
        "2208": {
          small:  471,
          medium: 1044,
          large:  1071,
          left:  99,
          right: 672,
          top:    114,
          middle: 696,
          bottom: 1278
        },
        
        // SE2 and 6/6S/7/8
        "1334": {
          small:  296,
          medium: 642,
          large:  648,
          left:  54,
          right: 400,
          top:    60,
          middle: 412,
          bottom: 764
        },
        
        
        // SE1
        "1136": {
          small:  282,
          medium: 584,
          large:  622,
          left: 30,
          right: 332,
          top:  59,
          middle: 399,
          bottom: 399
        },
        
        // 11 and XR in Display Zoom mode
        "1624": {
          small: 310,
          medium: 658,
          large: 690,
          left: 46,
          right: 394,
          top: 142,
          middle: 522,
          bottom: 902 
        },
        
        // Plus in Display Zoom mode
        "2001" : {
          small: 444,
          medium: 963,
          large: 972,
          left: 81,
          right: 600,
          top: 90,
          middle: 618,
          bottom: 1146
        }
      }
      return phones
    }

    var message
    message = title || "开始之前，请先前往桌面,截取空白界面的截图。然后回来继续"
    let exitOptions = ["我已截图","前去截图 >"]
    let shouldExit = await generateAlert(message,exitOptions)
    if (shouldExit) return

    // Get screenshot and determine phone size.
    let img = await Photos.fromLibrary()
    let height = img.size.height
    let phone = phoneSizes()[height]
    if (!phone) {
      message = "好像您选择的照片不是正确的截图，或者您的机型我们暂时不支持。点击确定前往社区讨论"
      let _id = await generateAlert(message,["帮助", "取消"])
      if (_id===0) Safari.openInApp('https://support.qq.com/products/287371', false)
      return
    }

    // Prompt for widget size and position.
    message = "截图中要设置透明背景组件的尺寸类型是？"
    let sizes = ["小尺寸","中尺寸","大尺寸"]
    let size = await generateAlert(message,sizes)
    let widgetSize = sizes[size]

    message = "要设置透明背景的小组件在哪个位置？"
    message += (height == 1136 ? " （备注：当前设备只支持两行小组件，所以下边选项中的「中间」和「底部」的选项是一致的）" : "")

    // Determine image crop based on phone size.
    let crop = { w: "", h: "", x: "", y: "" }
    if (widgetSize == "小尺寸") {
      crop.w = phone.small
      crop.h = phone.small
      let positions = ["左上角","右上角","中间左","中间右","左下角","右下角"]
      let _posotions = ["Top left","Top right","Middle left","Middle right","Bottom left","Bottom right"]
      let position = await generateAlert(message,positions)
      
      // Convert the two words into two keys for the phone size dictionary.
      let keys = _posotions[position].toLowerCase().split(' ')
      crop.y = phone[keys[0]]
      crop.x = phone[keys[1]]
      
    } else if (widgetSize == "中尺寸") {
      crop.w = phone.medium
      crop.h = phone.small
      
      // Medium and large widgets have a fixed x-value.
      crop.x = phone.left
      let positions = ["顶部","中间","底部"]
      let _positions = ["Top","Middle","Bottom"]
      let position = await generateAlert(message,positions)
      let key = _positions[position].toLowerCase()
      crop.y = phone[key]
      
    } else if(widgetSize == "大尺寸") {
      crop.w = phone.medium
      crop.h = phone.large
      crop.x = phone.left
      let positions = ["顶部","底部"]
      let position = await generateAlert(message,positions)
      
      // Large widgets at the bottom have the "middle" y-value.
      crop.y = position ? phone.middle : phone.top
    }

    // 透明/模糊选项
    message = "需要给背景图片加什么显示效果？"
    let blurOptions = ["透明", "白色 模糊", "黑色 模糊"]
    let blurred = await generateAlert(message, blurOptions)

    // Crop image and finalize the widget.
    if (blurred) {
      const style = (blurred === 1) ? 'light' : 'dark'
      img = await blurImage(img, style)
    }
    let imgCrop = cropImage(img, new Rect(crop.x,crop.y,crop.w,crop.h))


    return imgCrop

  }

  /**
   * 弹出一个通知
   * @param {string} title 通知标题
   * @param {string} body 通知内容
   * @param {string} url 点击后打开的URL
   */
  async notify (title, body, url = null, opts = {}) {
    let n = new Notification()
    n = Object.assign(n, opts);
    n.title = title
    n.body = body
    if (url) n.openURL = url
    return await n.schedule()
  }


  /**
   * 给图片加一层半透明遮罩
   * @param {Image} img 要处理的图片
   * @param {string} color 遮罩背景颜色
   * @param {float} opacity 透明度
   */
  async shadowImage (img, color = '#000000', opacity = 0.7) {
    let ctx = new DrawContext()
    // 获取图片的尺寸
    ctx.size = img.size
    
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
    ctx.setFillColor(new Color(color, opacity))
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
    
    let res = await ctx.getImage()
    return res
  }
  
  /**
   * 获取当前插件的设置
   * @param {boolean} json 是否为json格式
   */
  getSettings(json=true){
    let res=json?{}:""
    let cache=""
    // if (global && Keychain.contains(this.SETTING_KEY2)) {
    //   cache = Keychain.get(this.SETTING_KEY2)
    // } else if (Keychain.contains(this.SETTING_KEY)) {
    //   cache = Keychain.get(this.SETTING_KEY)
    // } else if (Keychain.contains(this.SETTING_KEY1)) {
    //   cache = Keychain.get(this.SETTING_KEY1)
    // } else if (Keychain.contains(this.SETTING_KEY2)){
    if (Keychain.contains(this.SETTING_KEY)) {
      cache= Keychain.get(this.SETTING_KEY)
    }
      if (json){
        try {
          res=JSON.parse(cache)
        } catch (e) {}
      }else{
        res=cache
      }
    
    return res
  }

  /**
   * 存储当前设置
   * @param {bool} notify 是否通知提示
   */
  saveSettings(notify=true){
    let res= (typeof this.settings==="object")?JSON.stringify(this.settings):String(this.settings)
    Keychain.set(this.SETTING_KEY, res)
    if (notify) this.notify("设置成功","桌面组件稍后将自动刷新")
  }

  /**
   * 获取当前插件是否有自定义背景图片
   * @reutrn img | false
   */
  getBackgroundImage () {
    // 如果有KEY则优先加载，key>key1>key2
    // key2是全局
    let result = null
    if (this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_KEY)) {
      result = Image.fromFile(this.BACKGROUND_KEY)
    // } else if (this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_KEY1)) {
    //   result = Image.fromFile(this.BACKGROUND_KEY1)
    // } else if (this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_KEY2)) {
    //   result = Image.fromFile(this.BACKGROUND_KEY2)
    }
    return result
  }

  /**
   * 设置当前组件的背景图片
   * @param {image} img 
   */
  setBackgroundImage (img, notify = true) {
    if (!img) {
      // 移除背景
      if (this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_KEY)) {
        this.FILE_MGR_LOCAL.remove(this.BACKGROUND_KEY)
      // } else if (this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_KEY1)) {
      //   this.FILE_MGR_LOCAL.remove(this.BACKGROUND_KEY1)
      // } else if (this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_KEY2)) {
      //   this.FILE_MGR_LOCAL.remove(this.BACKGROUND_KEY2)
      }
      if (notify) this.notify("移除成功", "小组件背景图片已移除，稍后刷新生效")
    } else {
      // 设置背景
      // 全部设置一遍，
      this.FILE_MGR_LOCAL.writeImage(this.BACKGROUND_KEY, img)
      // this.FILE_MGR_LOCAL.writeImage(this.BACKGROUND_KEY1, img)
      // this.FILE_MGR_LOCAL.writeImage(this.BACKGROUND_KEY2, img)
      if (notify) this.notify("设置成功", "小组件背景图片已设置！稍后刷新生效")
    }
  }
  
}
// @base.end
// 运行环境
// @running.start
const Running = async (Widget, default_args = "") => {
  let M = null
  // 判断hash是否和当前设备匹配
  if (config.runsInWidget) {
    M = new Widget(args.widgetParameter || '')
    const W = await M.render()
    Script.setWidget(W)
    Script.complete()
  } else {
    let { act, data, __arg, __size } = args.queryParameters
    M = new Widget(__arg || default_args || '')
    if (__size) M.init(__size)
    if (!act || !M['_actions']) {
      // 弹出选择菜单
      const actions = M['_actions']
      const _actions = []
      const alert = new Alert()
      alert.title = M.name
      alert.message = M.desc

      for (let _ in actions) {
        alert.addAction(_)
        _actions.push(actions[_])
      }
      alert.addCancelAction("取消操作")
      const idx = await alert.presentSheet()
      if (_actions[idx]) {
        const func = _actions[idx]
        await func()
      }
      return
    }
    let _tmp = act.split('-').map(_ => _[0].toUpperCase() + _.substr(1)).join('')
    let _act = `action${_tmp}`
    if (M[_act] && typeof M[_act] === 'function') {
      const func = M[_act].bind(M)
      await func(data)
    }
  }
}


let WIDGET_FILE_NAME = 'bmw-linker.js';
let WIDGET_VERSION = 'v2.1.5';
let WIDGET_BUILD = '21122102';
let WIDGET_PREFIX = '[bmw-linker] ';

let DEPENDENCIES = [
    'jsencrypt.js' //本地化加密
];

let WIDGET_FONT = 'SF UI Display';
let WIDGET_FONT_BOLD = 'SF UI Display Bold';
let BMW_SERVER_HOST = 'https://myprofile.bmw.com.cn';
let APP_HOST_SERVER = 'https://bmw-linker.com';
let JS_CDN_SERVER = 'https://cdn.jsdelivr.net/gh/opp100/bmw-scriptable-widgets@main/Publish/';
let JS_LIB_CDN_SERVER = 'https://cdn.jsdelivr.net/gh/opp100/bmw-scriptable-widgets/lib';

let DEFAULT_BG_COLOR_LIGHT = '#FFFFFF';
let DEFAULT_BG_COLOR_DARK = '#2B2B2B';
let DEFAULT_LOGO_LIGHT = 'https://z3.ax1x.com/2021/11/01/ICa7g1.png';
let DEFAULT_LOGO_DARK = 'https://z3.ax1x.com/2021/11/01/ICaqu6.png';

// header is might be used for preventing the bmw block the external api?
let BMW_HEADERS = {
    'user-agent': 'Dart/2.10 (dart:io)',
    'x-user-agent': 'ios(15.0.2);bmw;1.6.6(10038)'
};

// setup local storage keys
let MY_BMW_REFRESH_TOKEN = 'MY_BMW_REFRESH_TOKEN';
let MY_BMW_TOKEN = 'MY_BMW_TOKEN';
let MY_BMW_TOKEN_UPDATE_LAST_AT = 'MY_BMW_TOKEN_UPDATE_LAST_AT';
let MY_BMW_LAST_CHECK_IN_AT = 'MY_BMW_LAST_CHECK_IN_AT';
let APP_USE_AGREEMENT = 'APP_USE_AGREEMENT';
let MY_BMW_VEHICLE_UPDATE_LAST_AT = 'MY_BMW_VEHICLE_UPDATE_LAST_AT';
let MY_BMW_VEHICLE_DATA = 'MY_BMW_VEHICLE_DATA';
let WIDGET_UPDATED_AT = 'WIDGET_UPDATED_AT';
let WIDGET_DANGER_COLOR = '#ff0000';
class Widget extends Base {
    DeviceSize = {
        '428x926': {
            small: {width: 176, height: 176},
            medium: {width: 374, height: 176},
            large: {width: 374, height: 391}
        },
        '390x844': {
            small: {width: 161, height: 161},
            medium: {width: 342, height: 161},
            large: {width: 342, height: 359}
        },
        '414x896': {
            small: {width: 169, height: 169},
            medium: {width: 360, height: 169},
            large: {width: 360, height: 376}
        },
        '375x812': {
            small: {width: 155, height: 155},
            medium: {width: 329, height: 155},
            large: {width: 329, height: 345}
        },
        '414x736': {
            small: {width: 159, height: 159},
            medium: {width: 348, height: 159},
            large: {width: 348, height: 357}
        },
        '375x667': {
            small: {width: 148, height: 148},
            medium: {width: 322, height: 148},
            large: {width: 322, height: 324}
        },
        '320x568': {
            small: {width: 141, height: 141},
            medium: {width: 291, height: 141},
            large: {width: 291, height: 299}
        }
    };

    userConfigData = {
        username: '',
        password: '',
        custom_name: '',
        custom_vehicle_image: null,
        custom_logo_image: null,
        vin: '',
        map_api_key: null,
        show_control_checks: 0,
        force_dark_theme: null
    };

    appColorData = {
        light: {
            startColor: DEFAULT_BG_COLOR_LIGHT,
            endColor: DEFAULT_BG_COLOR_LIGHT,
            fontColor: DEFAULT_BG_COLOR_DARK
        },
        dark: {
            startColor: DEFAULT_BG_COLOR_DARK,
            endColor: DEFAULT_BG_COLOR_DARK,
            fontColor: DEFAULT_BG_COLOR_LIGHT
        }
    };

    constructor(arg) {
        super(arg);
        this.name = 'BMW-Linker';
        this.desc = '宝马My BMW互联App小组件';

        // load settings
        this.userConfigData = {...this.userConfigData, ...this.settings['UserConfig']};

        let colorSettings = this.settings['AppColorConfig'];
        if (typeof colorSettings == 'string') {
            try {
                colorSettings = JSON.parse(colorSettings);
            } catch (e) {
                colorSettings = {};
            }
        }
        this.appColorData = {...this.appColorData, ...colorSettings};

        if (config.runsInApp) {
            this.registerAction('退出登录', this.userCleanAlert);
            this.registerAction('关于小组件', this.aboutAction);
            this.registerAction('检查更新', this.checkUpdatePress);
            this.registerAction('配置小组件', this.userConfigInput);
            this.registerAction('登录My BMW', this.userLoginInput);
        }
    }

    async userLoginInput() {
        const confirmationAlert = new Alert();

        confirmationAlert.title = '郑重声明';
        confirmationAlert.message = `小组件需要使用到您的BMW账号\n\r\n首次登录请配置账号、密码进行令牌获取\n\r\n小组件不会收集您的个人账户信息，所有账号信息将存在iCloud或者iPhone上但也请您妥善保管自己的账号\n\r\n小组件是开源、并且完全免费的，由BMW车主开发，所有责任与BMW公司无关\n\r\n开发者: Yocky Xiang， UI设计: Popo`;

        confirmationAlert.addAction('同意');
        confirmationAlert.addCancelAction('不同意');

        await this.getDependencies();

        const userSelection = await confirmationAlert.presentAlert();
        if (userSelection == -1) {
            console.log('User denied');
            Keychain.set(APP_USE_AGREEMENT, 'false');
            return;
        }
        Keychain.set(APP_USE_AGREEMENT, 'true');

        return await this.userLoginCredentials();
    }

    async userCleanAlert() {
        const confirmationAlert = new Alert();

        confirmationAlert.title = '提示';
        confirmationAlert.message = '您的所有账户信息与设置将会从小组件中移除';

        confirmationAlert.addAction('退出登录');
        confirmationAlert.addCancelAction('取消');

        const userSelection = await confirmationAlert.presentAlert();
        if (userSelection == -1) {
            return;
        }

        try {
            if (this.SETTING_KEY && Keychain.contains(this.SETTING_KEY)) {
                Keychain.remove(this.SETTING_KEY);
            }
        } catch (e) {
            console.error('Clean User: ' + e.message);
        }

        try {
            let _fileKey = this.md5(Script.name());
            if (_fileKey && Keychain.contains(_fileKey)) {
                Keychain.remove(_fileKey);
            }
        } catch (e) {
            console.error('Clean User: ' + e.message);
        }

        let vin = this.userConfigData.vin || '';

        let lastUpdateKey = vin + MY_BMW_VEHICLE_UPDATE_LAST_AT;
        let localVehicleDataKey = vin + MY_BMW_VEHICLE_DATA;

        let keyStoreArray = [
            MY_BMW_LAST_CHECK_IN_AT,
            MY_BMW_REFRESH_TOKEN,
            MY_BMW_TOKEN,
            MY_BMW_TOKEN_UPDATE_LAST_AT,
            MY_BMW_VEHICLE_UPDATE_LAST_AT,
            APP_USE_AGREEMENT,
            WIDGET_UPDATED_AT,
            lastUpdateKey,
            localVehicleDataKey
        ];
        for (const key of keyStoreArray) {
            try {
                if (Keychain.contains(key)) {
                    Keychain.remove(key);
                }
            } catch (e) {}
        }

        this.notify('退出成功', '账户设置信息已经从小组件中删除');
    }

    async aboutAction() {
        Safari.open(APP_HOST_SERVER + '/about.html');
    }

    async userLoginCredentials() {
        const userLoginAlert = new Alert();
        userLoginAlert.title = '配置BMW登录';
        userLoginAlert.message = '配置My BMW账号密码';

        userLoginAlert.addTextField('账号(您的电话)', this.userConfigData['username']);
        userLoginAlert.addSecureTextField('密码(请在MY BMW中提前设置)', this.userConfigData['password']);

        userLoginAlert.addAction('确定');
        userLoginAlert.addCancelAction('取消');

        const id = await userLoginAlert.presentAlert();

        if (id == -1) {
            return;
        }

        this.userConfigData['username'] = this.formatUserMobile(userLoginAlert.textFieldValue(0));
        this.userConfigData['password'] = userLoginAlert.textFieldValue(1);

        // try login first
        let loginResult = await this.myBMWLogin();

        if (!loginResult) {
            const messageAlert = new Alert();
            messageAlert.title = '登录失败';
            messageAlert.message = '请检查您的账号密码';
            messageAlert.addCancelAction('取消');
            await messageAlert.presentAlert();

            return this.userLoginCredentials();
        }

        // write to local
        this.settings['UserConfig'] = this.userConfigData;
        this.saveSettings(false);

        // start to get vehicle details
        return this.getData(true);
    }

    formatUserMobile(mobileStr) {
        // remove all non numerical char
        mobileStr = mobileStr.replace(/\D/g, '');

        if (mobileStr.startsWith('86')) {
            return mobileStr;
        }

        if (mobileStr.length == 11) {
            return '86' + mobileStr;
        }

        return mobileStr;
    }

    async checkUpdate(automated = false) {
        try {
            let updateAT = null;
            if (automated && Keychain.contains(WIDGET_UPDATED_AT)) {
                updateAT = parseInt(Keychain.get(WIDGET_UPDATED_AT));
                if (updateAT && updateAT > new Date().valueOf() - 1000 * 60 * 60 * 4) {
                    return console.warn('update checked within last 4 hour');
                }
            }

            const req = new Request(JS_CDN_SERVER + '/version.json');
            const res = await req.loadJSON();

            updateAT = new Date().valueOf();
            Keychain.set(WIDGET_UPDATED_AT, String(updateAT));

            if (res && Number(res['WIDGET_BUILD']) > Number(WIDGET_BUILD)) {
                if (automated) {
                    this.notify('BMW-Linker找到更新', '请打开Scriptable 点击 BMW-Linker 检查更新并下载');
                }
                return true;
            }
        } catch (e) {
            console.error('Check Update: ' + e.message);
            return false;
        }

        return false;
    }

    async downloadUpdate() {
        try {
            const fileManager = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();

            const req = new Request(JS_CDN_SERVER + '/bmw-linker.js');
            const res = await req.load();
            fileManager.write(fileManager.joinPath(fileManager.documentsDirectory(), WIDGET_FILE_NAME), res);

            this.notify('更新成功', 'BMW Linker 小组件已经更新');
        } catch (e) {
            console.error('Check Update 2: ' + e.message);
            this.notify('更新失败', '请稍后尝试');
        }
    }

    async getDependencies() {
        const fileManager = FileManager['local']();
        let folder = fileManager.documentsDirectory();

        let libFolder = fileManager.joinPath(folder, 'lib');
        try {
            if (!fileManager.isDirectory(libFolder)) {
                fileManager.createDirectory(libFolder);
            }
        } catch (e) {
            console.error('Get Dependencies: ' + e.message);
        }

        return await Promise.all(
            DEPENDENCIES.map(async (js) => {
                try {
                    let jsName = js.replace('.js', '');
                    let jsFolder = fileManager.joinPath(libFolder, jsName);

                    try {
                        if (!fileManager.isDirectory(jsFolder)) {
                            fileManager.createDirectory(jsFolder);
                        }
                    } catch (e) {
                        console.error(e.message);
                    }

                    // download the file to lib folder
                    let filePath = fileManager.joinPath(jsFolder, 'index.js');
                    let fileExists = fileManager.fileExists(filePath);

                    if (fileExists) {
                        return console.warn('Dependency found: ' + filePath);
                    }

                    const req = new Request(`${JS_LIB_CDN_SERVER}/${encodeURIComponent(js)}`);
                    const res = await req.load();

                    try {
                        fileManager.write(filePath, res);
                        console.warn(js + ' downloaded');
                    } catch (e) {
                        console.error(e.message);
                    }

                    fileExists = fileManager.fileExists(filePath);
                    if (!fileExists) {
                        this.notify('BMW LINKER错误', '下载依赖文件失败，请重新尝试配置');
                    }

                    return console.warn('Dependency found: ' + filePath);
                } catch (e) {
                    console.error('Dependency Download: ' + e.message);
                }
            })
        );
    }

    async checkUpdatePress() {
        let hasUpdate = await this.checkUpdate();
        console.warn('hasUpdate');
        const updateAlert = new Alert();
        updateAlert.title = '暂无更新';

        if (hasUpdate) {
            // load changes log
            let changeLogText = await this.loadChangeLogs();
            updateAlert.title = '找到更新';

            updateAlert.message = changeLogText;

            updateAlert.message += '\n\r\n是否开始下载?';

            updateAlert.addAction('开始下载');
        } else {
            updateAlert.message = '但您可重新下载小组件\n\r\n是否重新下载?';

            updateAlert.addAction('重新下载');
        }

        updateAlert.addCancelAction('取消');

        let result = await updateAlert.presentAlert();

        if (result == -1) {
            return;
        }

        // start to download
        await this.downloadUpdate();
    }

    async loadChangeLogs() {
        try {
            let req = new Request(JS_CDN_SERVER + '/change_logs.text');

            req.method = 'GET';
            let changeLog = await req.loadString();

            return changeLog;
        } catch (e) {
            return '';
        }
    }

    async userConfigInput() {
        const userCustomConfigAlert = new Alert();
        userCustomConfigAlert.title = '自定义小组件';
        userCustomConfigAlert.message = '以下可以不用填写，留空信息会从系统自动获取';

        // refer to default config
        let configSet = {
            custom_name: '自定义车名（默认自动获取）',
            custom_vehicle_image: '车辆图片URL（默认自动获取）',
            custom_logo_image: 'LOGO URL(默认自动获取）',
            vin: '车架号(多辆BMW时填写)',
            map_api_key: '高德地图API_KEY（非必要）',
            force_dark_theme: '总是深色主题（是or否）'
        };

        for (const key in configSet) {
            if (!configSet[key] || !this.userConfigData.hasOwnProperty(key)) {
                continue;
            }

            if (key == 'force_dark_theme') {
                userCustomConfigAlert.addTextField(configSet[key], this.userConfigData[key] ? '是' : null);
                continue;
            }

            userCustomConfigAlert.addTextField(configSet[key], this.userConfigData[key]);
        }

        userCustomConfigAlert.addCancelAction('跳过');
        userCustomConfigAlert.addAction('下一步');

        let result = await userCustomConfigAlert.presentAlert();

        if (result == -1) {
            return;
        }

        // start to get data
        for (const key in configSet) {
            if (!configSet[key] || !this.userConfigData.hasOwnProperty(key)) {
                continue;
            }

            let index = Object.keys(configSet).indexOf(key);
            this.userConfigData[key] = userCustomConfigAlert.textFieldValue(index);

            if (key != 'custom_name') {
                this.userConfigData[key] = this.userConfigData[key].replace(' ', '');
            }
            if (key == 'force_dark_theme') {
                this.userConfigData[key] = this.userConfigData[key] && this.userConfigData[key] == '是';
            }
        }

        // write to local
        this.settings['UserConfig'] = this.userConfigData;
        this.saveSettings(false);

        await this.controlCheckSetup();
        await this.colorSetPickUp();
    }

    async colorSetPickUp() {
        const colorSetPickup = new Alert();

        colorSetPickup.title = '选取背景颜色';
        colorSetPickup.message = `请根据车辆颜色选取背景`;

        let systemColorSet = {
            白色: {
                light: {
                    startColor: '#c7c7c7',
                    endColor: '#fff',
                    fontColor: '#1d1d1d'
                },
                dark: {
                    startColor: '#232323',
                    endColor: '#5b5d61',
                    fontColor: '#fff'
                }
            },
            黑色: {
                light: {
                    startColor: '#5e627d',
                    endColor: '#fff',
                    fontColor: '#1d1d1d'
                },
                dark: {
                    startColor: '#2d2f40',
                    endColor: '#666878',
                    fontColor: '#fff'
                }
            },
            蓝色: {
                light: {
                    startColor: '#6887d1',
                    endColor: '#fff',
                    fontColor: '#1d1d1d'
                },
                dark: {
                    startColor: '#23345e',
                    endColor: '#526387',
                    fontColor: '#fff'
                }
            },
            红色: {
                light: {
                    startColor: '#b16968',
                    endColor: '#fff',
                    fontColor: '#1d1d1d'
                },
                dark: {
                    startColor: '#a84242',
                    endColor: '#540101',
                    fontColor: '#fff'
                }
            },
            橙色: {
                light: {
                    startColor: '#ffc699',
                    endColor: '#fff',
                    fontColor: '#1d1d1d'
                },
                dark: {
                    startColor: '#bd5608',
                    endColor: '#732600',
                    fontColor: '#fff'
                }
            }
        };

        for (const key in systemColorSet) {
            colorSetPickup.addAction(key);
        }

        // last index alway be the custom
        colorSetPickup.addAction('自定义');

        const userSelection = await colorSetPickup.presentAlert();

        // start to get data
        for (const key in systemColorSet) {
            if (!systemColorSet[key]) {
                continue;
            }

            let index = Object.keys(systemColorSet).indexOf(key);
            if (index == userSelection) {
                this.settings['AppColorConfig'] = systemColorSet[key];
            }
        }

        if (userSelection >= Object.keys(systemColorSet).length) {
            this.settings['AppColorConfig'] = await this.colorConfigInput();
        }
        // write to local
        this.saveSettings();
    }

    async controlCheckSetup() {
        const controlCheckAlert = new Alert();

        controlCheckAlert.title = '是否显示车辆检查';
        controlCheckAlert.message = '是否显示额外的车辆检查信息？\n\r\n如机油保养、轮胎压力检查或者ALL GOOD。';

        controlCheckAlert.addAction('不显示');
        // last index alway be the custom
        controlCheckAlert.addAction('显示所有检查信息');
        controlCheckAlert.addAction('只显示ALL GOOD');

        const userSelection = await controlCheckAlert.presentAlert();

        this.userConfigData['show_control_checks'] = Number(userSelection);
        this.settings['UserConfig'] = this.userConfigData;

        // write to local
        this.saveSettings(false);
    }

    async colorConfigInput() {
        const bgColorAlert = new Alert();

        bgColorAlert.title = '配置背景颜色';
        bgColorAlert.message = '请输入16进制RBG颜色代码, 留空小组件将自动从系统获取';

        bgColorAlert.addTextField('顶部颜色（如#FFFFFF）', this.appColorData['light']['startColor']);
        bgColorAlert.addTextField('底部颜色（如#FFFFFF）', this.appColorData['light']['endColor']);
        bgColorAlert.addTextField('字体颜色（如#000000）', this.appColorData['light']['fontColor']);

        bgColorAlert.addAction('确定');
        bgColorAlert.addCancelAction('取消');

        const id = await bgColorAlert.presentAlert();

        if (id == -1) {
            return this.appColorData;
        }

        let appColorConfig = {
            startColor: bgColorAlert.textFieldValue(0),
            endColor: bgColorAlert.textFieldValue(1),
            fontColor: bgColorAlert.textFieldValue(2)
        };

        return {light: appColorConfig, dark: appColorConfig};
    }

    async render() {
        // check all dependencies
        await this.getDependencies();

        await this.renderError('载入中...');

        if (
            (!this.userConfigData.username || this.userConfigData.username == '') &&
            (!this.userConfigData.custom_name || this.userConfigData.custom_name == '')
        ) {
            return await this.renderError('请先配置用户');
        }

        try {
            this.checkUpdate(true);
        } catch (e) {}

        let data = await this.getData();

        if (
            !data &&
            (!this.userConfigData.username || this.userConfigData.username == '') &&
            this.userConfigData.custom_name &&
            this.userConfigData.custom_name != ''
        ) {
            // put default data
            data = {
                status: {
                    doorsGeneralState: '已上锁',
                    lastUpdatedAt: new Date(),
                    fuelIndicators: [
                        {
                            rangeValue: '888',
                            levelValue: '99',
                            rangeUnits: 'km',
                            levelUnits: '%'
                        }
                    ],
                    currentMileage: {mileage: 2233, units: 'km'}
                }
            };
        }

        if (!data) {
            return await this.renderError('获取车辆信息失败，请检查授权');
        }

        // start to render if we get information
        try {
            let screenSize = Device.screenSize();

            data.size = this.DeviceSize[`${screenSize.width}x${screenSize.height}`] || this.DeviceSize['375x812'];
        } catch (e) {
            console.warn('Display Error: ' + e.message);
            await this.renderError('显示错误：' + e.message);
        }
        //console.log(JSON.stringify(data))
        switch (this.widgetFamily) {
            case 'large':
                return await this.renderLarge(data);
            case 'medium':
                return await this.renderMedium(data);
            default:
                return await this.renderSmall(data);
        }
    }

    async getAppLogo() {
        let logoURL = DEFAULT_LOGO_LIGHT;

        // not load dynamically have to re add the widget
        let darkModel = Device.isUsingDarkAppearance();
        if (darkModel) {
            // logoURL = DEFAULT_LOGO_DARK;
        }

        if (this.userConfigData.custom_logo_image) {
            logoURL = this.userConfigData.custom_logo_image;
        }

        return await this.getImageByUrl(logoURL);
    }

    async renderError(errMsg) {
        let w = new ListWidget();
        w.backgroundGradient = this.getBackgroundColor();

        const padding = 16;
        w.setPadding(padding, padding, padding, padding);
        w.addStack().addText(errMsg);
        return w;
    }

    getFontColor() {
        if (this.userConfigData.force_dark_theme) {
            return Color.white();
        }
        if (this.validColorString(this.appColorData.light.fontColor)) {
            return Color.dynamic(
                new Color(this.appColorData['light']['fontColor'], 1),
                new Color(this.appColorData['dark']['fontColor'], 1)
            );
        }
        return Color.dynamic(new Color('#2B2B2B', 1), Color.white());
    }

    getBackgroundColor() {
        const bgColor = new LinearGradient();

        let startColor = Color.dynamic(new Color(DEFAULT_BG_COLOR_LIGHT, 1), new Color(DEFAULT_BG_COLOR_DARK, 1));
        let endColor = Color.dynamic(new Color(DEFAULT_BG_COLOR_LIGHT, 1), new Color(DEFAULT_BG_COLOR_DARK, 1));

        try {
            if (this.userConfigData.force_dark_theme) {
                startColor = new Color(this.appColorData['dark']['startColor'], 1);
                endColor = new Color(this.appColorData['dark']['endColor'], 1);
            } else if (
                this.appColorData.light.startColor != DEFAULT_BG_COLOR_LIGHT ||
                this.appColorData.light.endColor != DEFAULT_BG_COLOR_LIGHT
            ) {
                // if user override
                if (
                    this.validColorString(this.appColorData['light'].startColor) &&
                    this.validColorString(this.appColorData['light'].endColor)
                ) {
                    startColor = Color.dynamic(
                        new Color(this.appColorData['light']['startColor'], 1),
                        new Color(this.appColorData['dark']['startColor'], 1)
                    );

                    endColor = Color.dynamic(
                        new Color(this.appColorData['light']['endColor'], 1),
                        new Color(this.appColorData['dark']['endColor'], 1)
                    );
                }
            }
        } catch (e) {
            console.error(e.message);
        }

        bgColor.colors = [startColor, endColor];

        bgColor.locations = [0.0, 1.0];

        return bgColor;
    }

    validColorString(colorStr) {
        return colorStr && colorStr.search('#') == 0 && (colorStr.length == 4 || colorStr.length == 7); // TODO: change to regex
    }

    async renderSmall(data) {
        let w = new ListWidget();
        let fontColor = this.getFontColor();
        w.backgroundGradient = this.getBackgroundColor();

        const width = data.size['small']['width'];
        const paddingLeft = Math.round(width * 0.07);

        w.setPadding(0, 0, 0, 0);

        const topBox = w.addStack();
        topBox.layoutHorizontally();
        topBox.setPadding(0, 0, 0, 0);

        // ---顶部左边部件---
        const topLeftContainer = topBox.addStack();

        const vehicleNameContainer = topLeftContainer.addStack();
        vehicleNameContainer.setPadding(paddingLeft, paddingLeft, 0, 0);

        let vehicleNameStr = `${data.brand} ${data.model}`;
        if (this.userConfigData.custom_name && this.userConfigData.custom_name.length > 0) {
            vehicleNameStr = this.userConfigData.custom_name;
        }
        const vehicleNameText = vehicleNameContainer.addText(vehicleNameStr);

        // get dynamic size
        let vehicleNameSize = Math.round(width * 0.12);

        if (vehicleNameStr.length >= 10) {
            vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
        }

        vehicleNameText.leftAlignText();
        vehicleNameText.font = this.getFont(`${WIDGET_FONT_BOLD}`, vehicleNameSize);
        vehicleNameText.textColor = fontColor;
        // ---顶部左边部件完---

        topBox.addSpacer();

        // ---顶部右边部件---
        const topRightBox = topBox.addStack();
        topRightBox.setPadding(6, 0, 0, paddingLeft);

        if (!this.userConfigData.custom_logo_image) {
            topRightBox.setPadding(paddingLeft, 0, 0, paddingLeft);
        }

        try {
            let logoImage = await this.getAppLogo();
            let logoImageWidget = topRightBox.addImage(logoImage);

            let logoContainerWidth = Math.round(width * 0.1);
            let imageSize = this.getImageSize(
                logoImage.size.width,
                logoImage.size.height,
                Math.round(logoContainerWidth * 2.5),
                logoContainerWidth,
                0.99
            );

            logoImageWidget.imageSize = new Size(imageSize.width, imageSize.width);
        } catch (e) {}
        // ---顶部右边部件完---

        // ---中间部件---
        const carInfoContainer = w.addStack();
        carInfoContainer.layoutVertically();
        carInfoContainer.setPadding(8, paddingLeft, 0, 0);

        const kmContainer = carInfoContainer.addStack();
        kmContainer.layoutHorizontally();
        kmContainer.bottomAlignContent();

        try {
            const {levelValue, levelUnits, rangeValue, rangeUnits} = this.getFuelIndicators(data.status.fuelIndicators);

            const kmText = kmContainer.addText(`${rangeValue + ' ' + rangeUnits}`);
            kmText.font = this.getFont(`${WIDGET_FONT}`, 17);
            kmText.textColor = fontColor;

            const levelContainer = kmContainer.addStack();
            const separator = levelContainer.addText(' / ');
            separator.font = this.getFont(`${WIDGET_FONT}`, 12);
            separator.textColor = fontColor;
            separator.textOpacity = 0.6;

            const levelText = levelContainer.addText(`${levelValue}${levelUnits}`);
            levelText.font = this.getFont(`${WIDGET_FONT}`, 14);
            levelText.textColor = fontColor;
            levelText.textOpacity = 0.6;
        } catch (e) {
            console.error(e.message);
            kmContainer.addText(`获取里程失败`);
        }

        const carStatusContainer = carInfoContainer.addStack();
        carStatusContainer.setPadding(2, 0, 0, 0);

        const carStatusBox = carStatusContainer.addStack();
        carStatusBox.setPadding(3, 3, 3, 3);
        carStatusBox.layoutHorizontally();
        carStatusBox.centerAlignContent();
        carStatusBox.cornerRadius = 4;
        carStatusBox.backgroundColor = this.getFocusedBackgroundColor();

        try {
            const carStatusTxt = carStatusBox.addText(`${data.status.doorsGeneralState}`);

            let displayFont = WIDGET_FONT;
            let displayFontColor = fontColor;
            if (data.properties && !data.properties.areDoorsClosed) {
                displayFontColor = new Color(WIDGET_DANGER_COLOR, 1);
                displayFont = WIDGET_FONT_BOLD;
            }

            carStatusTxt.font = this.getFont(displayFont, 10);
            carStatusTxt.textColor = displayFontColor;
            carStatusTxt.textOpacity = 0.7;
            carStatusBox.addSpacer(5);

            let statusLabel = this.formatStatusLabel(data);
            const updateTxt = carStatusBox.addText(statusLabel);
            updateTxt.font = this.getFont(`${WIDGET_FONT}`, 10);
            updateTxt.textColor = fontColor;
            updateTxt.textOpacity = 0.5;
        } catch (e) {
            console.error(e);
            carStatusBox.addText(`获取车门状态失败`);
        }

        // ---中间部件完---

        w.addSpacer();

        // ---底部部件---

        const carImageContainer = w.addStack();
        let canvasWidth = Math.round(width * 0.85);
        let canvasHeight = Math.round(width * 0.4);

        carImageContainer.setPadding(0, paddingLeft, 6, 0);
        if (!this.userConfigData.show_control_checks) {
            carImageContainer.layoutHorizontally();
            carImageContainer.addSpacer();
            carImageContainer.setPadding(6, paddingLeft, 6, paddingLeft);
        }

        let image = await this.getCarCanvasImage(data, canvasWidth, canvasHeight, 0.95);
        let carStatusImage = carImageContainer.addImage(image);
        carStatusImage.resizable = !this.userConfigData.show_control_checks;
        // ---底部部件完---

        w.url = 'de.bmw.connected.mobile20.cn://'; // BASEURL + encodeURI(SHORTCUTNAME);

        return w;
    }

    async renderMedium(data, renderLarge = false) {
        let w = new ListWidget();
        let fontColor = this.getFontColor();
        w.backgroundGradient = this.getBackgroundColor();

        w.setPadding(0, 0, 0, 0);
        const {width, height} = data.size['medium'];

        let paddingTop = Math.round(height * 0.09);
        let paddingLeft = Math.round(width * 0.055);

        let renderMediumContent = !renderLarge || this.userConfigData.map_api_key;

        const topContainer = w.addStack();
        topContainer.layoutHorizontally();

        const vehicleNameContainer = topContainer.addStack();
        vehicleNameContainer.layoutHorizontally();
        vehicleNameContainer.setPadding(paddingTop, paddingLeft, 0, 0);

        let vehicleNameStr = `${data.brand} ${data.model}`;
        if (this.userConfigData.custom_name && this.userConfigData.custom_name.length > 0) {
            vehicleNameStr = this.userConfigData.custom_name;
        }
        const vehicleNameText = vehicleNameContainer.addText(vehicleNameStr);

        let vehicleNameSize = 24;

        if (vehicleNameStr.length >= 10) {
            vehicleNameSize = vehicleNameSize - Math.round(vehicleNameStr.length / 4);
        }

        vehicleNameText.font = this.getFont(`${WIDGET_FONT_BOLD}`, vehicleNameSize);
        vehicleNameText.textColor = fontColor;
        vehicleNameContainer.addSpacer();

        const logoImageContainer = topContainer.addStack();
        logoImageContainer.layoutHorizontally();
        logoImageContainer.setPadding(paddingTop, 0, 0, paddingTop);

        try {
            let logoImage = logoImageContainer.addImage(await this.getAppLogo());
            logoImage.rightAlignImage();
        } catch (e) {}

        const bodyContainer = w.addStack();
        bodyContainer.layoutHorizontally();
        const leftContainer = bodyContainer.addStack();

        leftContainer.layoutVertically();
        leftContainer.size = new Size(Math.round(width * 0.85), Math.round(height * 0.75));
        if (renderMediumContent) {
            leftContainer.size = new Size(Math.round(width * 0.5), Math.round(height * 0.75));
        }
        leftContainer.addSpacer();

        const kmContainer = leftContainer.addStack();
        kmContainer.setPadding(0, paddingLeft, 0, 0);
        kmContainer.bottomAlignContent();

        try {
            const {levelValue, levelUnits, rangeValue, rangeUnits} = this.getFuelIndicators(data.status.fuelIndicators);
            const kmText = kmContainer.addText(`${rangeValue + ' ' + rangeUnits}`);
            kmText.font = this.getFont(`${WIDGET_FONT}`, 20);
            kmText.textColor = fontColor;

            const levelContainer = kmContainer.addStack();
            const separator = levelContainer.addText(' / ');
            separator.font = this.getFont(`${WIDGET_FONT}`, 16);
            separator.textColor = fontColor;
            separator.textOpacity = 0.6;

            const levelText = levelContainer.addText(`${levelValue}${levelUnits}`);
            levelText.font = this.getFont(`${WIDGET_FONT}`, 18);
            levelText.textColor = fontColor;
            levelText.textOpacity = 0.6;

            const mileageContainer = leftContainer.addStack();
            mileageContainer.setPadding(0, paddingLeft, 0, 0);

            let mileageText = mileageContainer.addText(
                `总里程: ${data.status.currentMileage.mileage} ${data.status.currentMileage.units}`
            );
            mileageText.font = this.getFont(`${WIDGET_FONT}`, 9);
            mileageText.textColor = fontColor;
            mileageText.textOpacity = 0.7;
        } catch (e) {
            console.error(e.message);
            kmContainer.addText(`获取里程失败`);
        }

        const carStatusContainer = leftContainer.addStack();
        carStatusContainer.setPadding(8, paddingLeft, 0, 0);

        const carStatusBox = carStatusContainer.addStack();
        carStatusBox.setPadding(3, 3, 3, 3);
        carStatusBox.layoutHorizontally();
        carStatusBox.centerAlignContent();
        carStatusBox.cornerRadius = 4;
        carStatusBox.backgroundColor = this.getFocusedBackgroundColor();

        try {
            const carStatusTxt = carStatusBox.addText(`${data.status.doorsGeneralState}`);

            let displayFont = WIDGET_FONT;
            let displayFontColor = fontColor;
            if (data.properties && !data.properties.areDoorsClosed) {
                displayFontColor = new Color(WIDGET_DANGER_COLOR, 1);
                displayFont = WIDGET_FONT_BOLD;
            }

            carStatusTxt.font = this.getFont(displayFont, 10);
            carStatusTxt.textColor = displayFontColor;
            carStatusTxt.textOpacity = 0.7;
            carStatusBox.addSpacer(5);

            let statusLabel = this.formatStatusLabel(data);
            const updateTxt = carStatusBox.addText(statusLabel);
            updateTxt.font = this.getFont(`${WIDGET_FONT}`, 10);
            updateTxt.textColor = fontColor;
            updateTxt.textOpacity = 0.5;
        } catch (e) {
            console.error(e.message);
            carStatusBox.addText(`获取车门状态失败`);
        }

        let locationStr = '';
        try {
            locationStr = data.properties.vehicleLocation.address.formatted;
        } catch (e) {}

        leftContainer.addSpacer();

        const locationContainer = leftContainer.addStack();
        locationContainer.setPadding(0, paddingLeft, 0, 0);
        if (renderMediumContent) {
            locationContainer.setPadding(0, paddingLeft, 16, 0);
        }
        const locationText = locationContainer.addText(locationStr);
        locationText.font = this.getFont(`${WIDGET_FONT}`, 10);
        locationText.textColor = fontColor;
        locationText.textOpacity = 0.5;
        locationText.url = this.buildMapURL(data);

        if (renderMediumContent) {
            const rightContainer = bodyContainer.addStack();
            rightContainer.setPadding(0, 0, 0, 0);
            rightContainer.layoutVertically();
            rightContainer.size = new Size(Math.round(width * 0.5), Math.round(height * 0.75));

            const carImageContainer = rightContainer.addStack();
            carImageContainer.bottomAlignContent();
            if (!this.userConfigData.show_control_checks) {
                carImageContainer.setPadding(0, 6, 0, paddingLeft);
            }

            let canvasWidth = Math.round(width * 0.45);
            let canvasHeight = Math.round(height * 0.55);

            let image = await this.getCarCanvasImage(data, canvasWidth, canvasHeight, 0.95);
            let carStatusImage = carImageContainer.addImage(image);
            carStatusImage.resizable = !this.userConfigData.show_control_checks;

            if (data.status && data.status.doorsAndWindows && data.status.doorsAndWindows.length > 0) {
                let doorWindowStatus = data.status.doorsAndWindows[0];

                let windowStatusContainer = rightContainer.addStack();
                windowStatusContainer.setPadding(6, 0, 12, 0);

                windowStatusContainer.layoutHorizontally();
                windowStatusContainer.addSpacer();

                let windowStatus = `${doorWindowStatus.title} ${doorWindowStatus.state} `;
                let windowStatusText = windowStatusContainer.addText(windowStatus);

                let displayFont = WIDGET_FONT;
                let displayFontColor = fontColor;
                if (data.properties && !data.properties.areWindowsClosed) {
                    displayFontColor = new Color(WIDGET_DANGER_COLOR, 1);
                    displayFont = WIDGET_FONT_BOLD;
                }

                windowStatusText.font = this.getFont(displayFont, 10);
                windowStatusText.textColor = displayFontColor;
                windowStatusText.textOpacity = 0.5;

                windowStatusContainer.addSpacer();
            }
        }

        w.url = 'de.bmw.connected.mobile20.cn://';

        return w;
    }

    async renderLarge(data) {
        let w = await this.renderMedium(data, true);
        const {width, height} = data.size['large'];
        w.setPadding(0, 0, 0, 0);
        w.addSpacer();
        let fontColor = this.getFontColor();

        let mapWidth = Math.ceil(width);
        let mapHeight = Math.ceil(height * 0.5);

        let paddingLeft = Math.round(width * 0.055);

        let largeExtraContainer = w.addStack();
        largeExtraContainer.layoutVertically();
        largeExtraContainer.bottomAlignContent();

        largeExtraContainer.size = new Size(mapWidth, mapHeight);

        if (this.userConfigData.map_api_key && this.userConfigData.map_api_key.length > 0) {
            let latLng = null;
            try {
                latLng =
                    data.properties.vehicleLocation.coordinates.longitude +
                    ',' +
                    data.properties.vehicleLocation.coordinates.latitude;
            } catch (e) {}

            let mapImage = await this.loadMapView(latLng, mapWidth, mapHeight);
            largeExtraContainer.addImage(mapImage);
            largeExtraContainer.url = this.buildMapURL(data);

            return w;
        }

        const carImageContainer = largeExtraContainer.addStack();
        carImageContainer.setPadding(0, paddingLeft, 0, paddingLeft);

        if (!this.userConfigData.show_control_checks) {
            carImageContainer.layoutHorizontally();
            carImageContainer.addSpacer();
            carImageContainer.setPadding(paddingLeft, 0, paddingLeft, 0);
        }

        carImageContainer.bottomAlignContent();

        try {
            let canvasWidth = Math.round(width * 0.9);
            let canvasHeight = Math.round(height * 0.45);

            let image = await this.getCarCanvasImage(data, canvasWidth, canvasHeight, 0.85);
            let carStatusImage = carImageContainer.addImage(image);

            carStatusImage.resizable = !this.userConfigData.show_control_checks;
            carStatusImage.centerAlignImage();
            if (!this.userConfigData.show_control_checks) {
                carImageContainer.addSpacer();
            }
            carStatusImage.url = 'de.bmw.connected.mobile20.cn://';
        } catch (e) {
            console.log(e.message);
        }

        if (data.status && data.status.doorsAndWindows && data.status.doorsAndWindows.length > 0) {
            let doorWindowStatus = data.status.doorsAndWindows[0];

            let windowStatusContainer = largeExtraContainer.addStack();
            windowStatusContainer.setPadding(2, 0, 16, 0);

            windowStatusContainer.layoutHorizontally();
            windowStatusContainer.addSpacer();

            let windowStatus = `${doorWindowStatus.title} ${doorWindowStatus.state} `;
            let windowStatusText = windowStatusContainer.addText(windowStatus);

            let displayFont = WIDGET_FONT;
            let displayFontColor = fontColor;
            if (data.properties && !data.properties.areWindowsClosed) {
                displayFontColor = new Color(WIDGET_DANGER_COLOR, 1);
                displayFont = WIDGET_FONT_BOLD;
            }

            windowStatusText.font = this.getFont(displayFont, 10);
            windowStatusText.textColor = displayFontColor;
            windowStatusText.textOpacity = 0.5;

            windowStatusContainer.addSpacer();
        }

        return w;
    }

    getImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight, resizeRate = 0.85) {
        let a = imageWidth;
        let b = imageHeight;

        if (a > canvasWidth || b > canvasHeight) {
            if (resizeRate >= 1) {
                resizeRate = 0.99;
            }
            a *= resizeRate;
            b *= resizeRate;
            return this.getImageSize(a, b, canvasWidth, canvasHeight);
        }

        return {width: a, height: b};
    }

    async getCarCanvasImage(data, canvasWidth, canvasHeight, resizeRate) {
        if (!this.userConfigData.show_control_checks) {
            try {
                let carImage = await this.getVehicleImage(data);

                return carImage;
            } catch (e) {
                console.warn(e);
            }
        }

        let canvas = new DrawContext();
        canvas.size = new Size(canvasWidth, canvasHeight);
        canvas.opaque = false;
        canvas.setFont(this.getFont(WIDGET_FONT_BOLD, Math.round(canvasHeight / 3.5)));
        canvas.setTextColor(this.getFontColor());
        canvas.respectScreenScale = true;

        let festivalBG = await this.getFestivalBackground();

        if (festivalBG) {
            let rate =
                festivalBG.size.width > festivalBG.size.height
                    ? festivalBG.size.height / festivalBG.size.width
                    : festivalBG.size.width / festivalBG.size.height;

            canvas.drawImageInRect(
                festivalBG,
                new Rect(
                    0, //
                    Math.round(canvasHeight * 0.04),
                    Math.round(canvasHeight * 0.9) * rate,
                    Math.round(canvasHeight * 0.9)
                )
            );
        } else {
            try {
                let checkControlMessages = this.getControlMessages(data);

                if (checkControlMessages && checkControlMessages.length == 0) {
                    canvas.drawTextInRect(
                        'ALL',
                        new Rect(
                            0, //
                            0,
                            Math.round(canvasWidth * 0.5),
                            Math.round(canvasWidth * 0.5)
                        )
                    );
                    canvas.drawTextInRect(
                        'GOOD',
                        new Rect(
                            0,
                            Math.round(canvasHeight / 4),
                            Math.round(canvasWidth * 0.5),
                            Math.round(canvasWidth * 0.5)
                        )
                    );
                } else {
                    let messageFontSize = Math.round(canvasHeight / 9);
                    let messageOffset = Math.round(messageFontSize * 1.5);

                    let exclamation = SFSymbol.named('exclamationmark.circle').image;
                    canvas.drawImageInRect(
                        exclamation,
                        new Rect(0, messageOffset, Math.round(messageFontSize * 1.2), Math.round(messageFontSize * 1.2))
                    );

                    canvas.setFont(this.getFont(WIDGET_FONT, messageFontSize));
                    canvas.setTextColor(this.getFontColor());

                    for (const checkControlMessage of checkControlMessages) {
                        canvas.drawTextInRect(
                            checkControlMessage.title,
                            new Rect(
                                Math.round(messageFontSize * 1.5),
                                messageOffset,
                                Math.round(canvasWidth * 0.5),
                                Math.round(canvasWidth * 0.5)
                            )
                        );

                        messageOffset = messageOffset + messageFontSize;
                    }
                }
            } catch (e) {
                console.warn(e.message);
            }
        }

        let carImage = await this.getVehicleImage(data);
        let imageSize = this.getImageSize(
            carImage.size.width,
            carImage.size.height,
            canvasWidth,
            canvasHeight,
            resizeRate
        );

        console.warn('rate ' + imageSize.width / imageSize.height);
        console.warn('imageSize ' + JSON.stringify(imageSize));

        canvas.drawImageInRect(
            carImage,
            new Rect(
                canvasWidth - imageSize.width, //
                canvasHeight - imageSize.height,
                imageSize.width,
                imageSize.height
            )
        );

        return canvas.getImage();
    }

    async getFestivalBackground() {
        let url = null;
        let now = new Date();
        let currentMonth = now.getMonth() + 1;
        let currentDate = now.getDate();

        if (currentMonth == 12) {
            if (currentDate >= 21 && currentDate <= 30) {
                url = 'https://s4.ax1x.com/2021/12/21/TMxdZF.png'; // Xmas
            }
            if (currentDate >= 31) {
                url = 'https://s4.ax1x.com/2021/12/21/TQFDvd.png'; // new year
            }
        }

        if (currentMonth == 1) {
            if (currentDate >= 1 && currentDate <= 3) {
                url = 'https://s4.ax1x.com/2021/12/21/TQFDvd.png'; // new year
            }
            if (currentDate >= 27 && currentDate <= 31) {
                url = 'https://s4.ax1x.com/2021/12/21/TQP2Lt.png';
            }
        }

        if (currentMonth == 2) {
            if (currentDate >= 1 && currentDate <= 7) {
                url = 'https://s4.ax1x.com/2021/12/21/TQP2Lt.png';
            }
        }

        try {
            if (!url) {
                return null;
            }
            return await this.getImageByUrl(url);
        } catch (e) {
            return null;
        }
    }

    getFocusedBackgroundColor() {
        if (this.userConfigData.force_dark_theme) {
            return new Color('#fff', 0.2);
        }
        return Color.dynamic(new Color('#f5f5f8', 0.45), new Color('#fff', 0.2));
    }

    async loadMapView(latLng, width, height, useCache = true) {
        try {
            if (!this.userConfigData.map_api_key) {
                throw '获取地图失败，请检查API KEY';
            }

            width = parseInt(width);
            height = parseInt(height);

            let mapApiKey = this.userConfigData.map_api_key;

            let url = `https://restapi.amap.com/v3/staticmap?location=${latLng}&scale=2&zoom=15&size=${width}*${height}&markers=large,0x00CCFF,:${latLng}&key=${mapApiKey}`;

            console.warn('load map from URL: ' + url);
            const cacheKey = this.md5(url);
            const cacheFile = FileManager.local().joinPath(FileManager.local().temporaryDirectory(), cacheKey);

            if (useCache && FileManager.local().fileExists(cacheFile)) {
                console.log('load map from cache');
                return Image.fromFile(cacheFile);
            }

            console.log('load map from API');

            let req = new Request(url);

            req.method = 'GET';

            const img = await req.loadImage();

            // 存储到缓存
            FileManager.local().writeImage(cacheFile, img);

            return img;
        } catch (e) {
            console.log('load map failed');
            console.error(e.message);
            let canvas = new DrawContext();
            canvas.size = new Size(width, height);

            canvas.setFillColor(new Color('#eee'));
            canvas.fillRect(new Rect(0, 0, width, height));
            canvas.drawTextInRect(e.message || '获取地图失败', new Rect(20, 20, width, height));

            return await canvas.getImage();
        }
    }

    getControlMessages(data) {
        try {
            if (this.userConfigData.show_control_checks == 2) {
                return [];
            }

            let checkControlMessages = data.status.checkControlMessages.filter((checkControlMessage) => {
                return checkControlMessage['criticalness'] != 'nonCritical';
            });

            if (data.status.issues) {
                for (const key in data.status.issues) {
                    if (!data.status.issues[key]) {
                        continue;
                    }
                    if (data.status.issues[key]['title']) {
                        checkControlMessages.push(data.status.issues[key]);
                    }
                }
            }
            return checkControlMessages;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    getFuelIndicators(fuelIndicators) {
        let _fuelObj = {
            levelValue: null,
            levelUnits: null,
            rangeValue: null,
            rangeUnits: null,
            chargingType: null
        };
        try {
            if (fuelIndicators.length == 1) {
                for (const key in _fuelObj) {
                    if (fuelIndicators[0][key] && !_fuelObj[key]) {
                        _fuelObj[key] = fuelIndicators[0][key];
                    }
                }
            } else {
                for (const fuelIndicator of fuelIndicators) {
                    if (!_fuelObj['rangeValue']) {
                        _fuelObj['rangeValue'] = Number(fuelIndicator['rangeValue']);
                        _fuelObj['rangeUnits'] = fuelIndicator['rangeUnits'];
                    }

                    if (Number(fuelIndicator['rangeValue']) >= _fuelObj['rangeValue']) {
                        _fuelObj['rangeValue'] = Number(fuelIndicator['rangeValue']);
                        _fuelObj['rangeUnits'] = fuelIndicator['rangeUnits'];
                    }
                }

                // if it is hyper vehicle, we are using range value as unit. eg 300km / 200km | 100km
                let unitText = '';
                for (const fuelIndicator of fuelIndicators) {
                    if (_fuelObj['rangeValue'] > fuelIndicator['rangeValue']) {
                        if (unitText != '') {
                            unitText += ' ';
                        }
                        unitText += `${fuelIndicator['rangeValue']}`;
                    }
                }
                _fuelObj['levelValue'] = unitText;
            }
        } catch (e) {}

        for (const key in _fuelObj) {
            if (!_fuelObj[key]) {
                _fuelObj[key] = '';
            }
        }

        return _fuelObj;
    }

    buildMapURL(data) {
        let locationStr = '';
        let latLng = '';

        try {
            locationStr = data.properties.vehicleLocation.address.formatted;
            latLng =
                data.properties.vehicleLocation.coordinates.longitude +
                ',' +
                data.properties.vehicleLocation.coordinates.latitude;
        } catch (e) {
            return '';
        }

        return `http://maps.apple.com/?address=${encodeURI(locationStr)}&ll=${latLng}&t=m`;
    }

    formatStatusLabel(data) {
        if (!data.status || !data.status.lastUpdatedAt) {
            return '';
        }

        let lastUpdated = new Date(data.status.lastUpdatedAt);
        const today = new Date();

        let formatter = 'MM-dd HH:mm';
        if (lastUpdated.getDate() == today.getDate()) {
            formatter = 'HH:mm';
        }

        let dateFormatter = new DateFormatter();
        dateFormatter.dateFormat = formatter;

        let dateStr = dateFormatter.string(lastUpdated);

        // get today

        return `${dateStr}更新`;
    }

    async getData(forceRefresh = false) {
        let accessToken = await this.getAccessToken(forceRefresh);

        if (!accessToken || accessToken == '') {
            return null;
        }

        try {
            await this.checkInDaily(accessToken);
        } catch (e) {
            console.error('Check In Error: ' + e.message);
        }

        return await this.getVehicleDetails(accessToken, forceRefresh);
    }

    async getPublicKey() {
        let req = new Request(BMW_SERVER_HOST + '/eadrax-coas/v1/cop/publickey');

        req.headers = {};

        const res = await req.loadJSON();
        if (res.code == 200 && res.data.value) {
            console.log('Getting public key success');
            return res.data.value;
        } else {
            console.log('Getting public key failed');
            return '';
        }
    }

    async getAccessToken(forceRefresh = false) {
        let accessToken = '';

        if (!forceRefresh && Keychain.contains(MY_BMW_TOKEN_UPDATE_LAST_AT)) {
            let lastUpdate = parseInt(Keychain.get(MY_BMW_TOKEN_UPDATE_LAST_AT));
            if (lastUpdate > new Date().valueOf() - 1000 * 60 * 50) {
                if (Keychain.contains(MY_BMW_TOKEN)) {
                    accessToken = Keychain.get(MY_BMW_TOKEN);
                }
            } else {
                if (Keychain.contains(MY_BMW_REFRESH_TOKEN)) {
                    let refreshToken = Keychain.get(MY_BMW_REFRESH_TOKEN);
                    // get refresh token
                    accessToken = await this.refreshToken(refreshToken);
                }
            }
        }

        if (accessToken && accessToken != '') {
            return accessToken;
        }

        console.log('No token found, get again');
        const res = await this.myBMWLogin();

        if (res) {
            const {access_token, refresh_token} = res;

            accessToken = access_token;
            try {
                Keychain.set(MY_BMW_TOKEN_UPDATE_LAST_AT, String(new Date().valueOf()));
                Keychain.set(MY_BMW_TOKEN, access_token);
                Keychain.set(MY_BMW_REFRESH_TOKEN, refresh_token);
            } catch (e) {
                console.error('Get Token: ' + e.message);
            }
        } else {
            accessToken = '';
        }

        return accessToken;
    }

    async myBMWLogin() {
        console.log('Start to get token');
        const _password = await this.getEncryptedPassword();
        let req = new Request(BMW_SERVER_HOST + '/eadrax-coas/v1/login/pwd');

        req.method = 'POST';

        req.body = JSON.stringify({
            mobile: this.userConfigData.username,
            password: _password
        });

        req.headers = BMW_HEADERS;

        console.log('trying to login');
        const res = await req.loadJSON();
        if (res.code == 200) {
            return res.data;
        } else {
            console.log('Get token error');
            console.log(res);

            return null;
        }
    }

    async getEncryptedPassword() {
        let publicKey = await this.getPublicKey();

        try {
            // 感谢沙包大佬提供思路
            let JSEncrypt = importModule(`lib/jsencrypt`);

            let encrypt = new JSEncrypt();
            encrypt.setPublicKey(publicKey);

            return encrypt.encrypt(this.userConfigData.password);
        } catch (e) {
            console.error('Encrypt error ' + e.message);
            return null;
        }
    }

    async refreshToken(refresh_token) {
        let req = new Request(BMW_SERVER_HOST + '/eadrax-coas/v1/oauth/token');
        req.headers = {
            ...BMW_HEADERS,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };
        req.method = 'POST';
        req.body = `grant_type=refresh_token&refresh_token=${refresh_token}`;
        const res = await req.loadJSON();

        if (res.accesstoken !== undefined) {
            const {accesstoken, refresh_token} = res;

            Keychain.set(MY_BMW_TOKEN, accesstoken);
            Keychain.set(MY_BMW_REFRESH_TOKEN, refresh_token);

            Keychain.set(MY_BMW_TOKEN_UPDATE_LAST_AT, String(new Date().valueOf()));

            return accesstoken;
        } else {
            return '';
        }
    }

    async getVehicleDetails(accesstoken, forceRefresh = false) {
        let vin = this.userConfigData.vin || '';

        let lastUpdateKey = vin + MY_BMW_VEHICLE_UPDATE_LAST_AT;
        let localVehicleDataKey = vin + MY_BMW_VEHICLE_DATA;

        let cacheData = this.loadVehicleFromCache(vin);

        // skip update prevent access to bmw too much
        if (!forceRefresh && cacheData) {
            if (Keychain.contains(lastUpdateKey)) {
                let lastUpdate = parseInt(Keychain.get(lastUpdateKey));

                // if last check within 5 mins we return cache
                if (lastUpdate > new Date().valueOf() - 1000 * 60 * 5) {
                    console.log('Get vehicle data from cache');
                    // return cacheData;
                }
            }
        }

        let vehicleData = null;

        try {
            console.log('Start to get vehicle details online');
            let req = new Request(BMW_SERVER_HOST + `/eadrax-vcs/v1/vehicles?appDateTime=${new Date().valueOf()}`);
            // let req = new Request(`http://192.168.50.7:5566/Publish/example.json?appDateTime=${new Date().valueOf()}`);

            req.headers = {
                ...BMW_HEADERS,
                authorization: 'Bearer ' + accesstoken,
                'content-type': 'application/json; charset=utf-8'
            };

            const vehicles = await req.loadJSON();

            if (vehicles && Array.isArray(vehicles) && vehicles.length > 0) {
                console.log('Get vehicle details success');
                if (vin && vin.length > 0) {
                    // if more than one vehicle
                    let vehicleFound = vehicles.find((vehicle) => {
                        return vehicle.vin && vehicle.vin.toUpperCase() == vin.toUpperCase();
                    });

                    if (vehicleFound) {
                        console.log('VIN matched and found: ' + vin);

                        vehicleData = vehicleFound;
                    }
                }

                vehicleData = vehicleData || vehicles[0];

                if (vehicleData) {
                    Keychain.set(lastUpdateKey, String(new Date().valueOf()));
                    Keychain.set(localVehicleDataKey, JSON.stringify(vehicleData));

                    if (config.runsInApp) {
                        const confirmationAlert = new Alert();

                        confirmationAlert.title = '成功';
                        confirmationAlert.message =
                            '车辆信息获取成功，请在桌面配置小组件。更多小组件设置请点击 开始配置';

                        confirmationAlert.addCancelAction('跳过');
                        confirmationAlert.addAction('开始配置');

                        let userSelection = await confirmationAlert.presentAlert();

                        if (userSelection != -1) {
                            await this.userConfigInput();
                        }
                    }
                }
            }
        } catch (e) {
            if (config.runsInApp) {
                const confirmationAlert = new Alert();

                confirmationAlert.title = '错误';
                confirmationAlert.message = '尝试获取车辆信息失败，请重新尝试登录。';

                confirmationAlert.addCancelAction('确定');

                await confirmationAlert.presentAlert();
            }
        }

        // if vehicle data is not found we use cache
        return vehicleData && vehicleData.vin ? vehicleData : cacheData;
    }

    async loadVehicleFromCache(vin) {
        let localVehicleDataKey = vin + MY_BMW_VEHICLE_DATA;

        try {
            if (Keychain.contains(localVehicleDataKey)) {
                let cachedVehicleData = JSON.parse(Keychain.get(localVehicleDataKey));

                // load data every 5 mins
                if (cachedVehicleData && cachedVehicleData.vin) {
                    return cachedVehicleData;
                }
            }
        } catch (e) {
            console.warn('Load vehicle from cache failed');
        }

        return null;
    }

    async checkInDaily(accesstoken) {
        let dateFormatter = new DateFormatter();
        const lastCheckIn = Keychain.contains(MY_BMW_LAST_CHECK_IN_AT) ? Keychain.get(MY_BMW_LAST_CHECK_IN_AT) : null;

        dateFormatter.dateFormat = 'yyyy-MM-dd';
        let today = dateFormatter.string(new Date());

        if (Keychain.contains(MY_BMW_LAST_CHECK_IN_AT)) {
            console.log('last checked in at: ' + lastCheckIn);

            if (lastCheckIn == today) {
                console.log('User has checked in today');

                return;
            }
        }

        console.log('Start check in');
        let req = new Request(BMW_SERVER_HOST + '/cis/eadrax-community/private-api/v1/mine/check-in');
        req.headers = {
            ...BMW_HEADERS,
            authorization: 'Bearer ' + accesstoken,
            'content-type': 'application/json; charset=utf-8'
        };

        req.method = 'POST';
        req.body = JSON.stringify({signDate: null});

        const res = await req.loadJSON();

        if (Number(res.code) >= 200 && Number(res.code) <= 300) {
            Keychain.set(MY_BMW_LAST_CHECK_IN_AT, today);
        }

        let msg = `${res.message || ''}`;

        if (res.code != 200) {
            msg += `: ${res.businessCode || ''}, 上次签到: ${lastCheckIn || 'None'}.`;
            this.notify('My BMW签到', msg);
        }

        try {
            await this.fakeShareToGetMoreCoin(accesstoken);
        } catch (e) {
            console.error(e.message);
        }

        // check coin amount
        try {
            await this.getJoyCoinInfo(accesstoken);
        } catch (e) {
            console.error(e.message);
        }
    }

    async getJoyCoinInfo(accesstoken) {
        let req = new Request(BMW_SERVER_HOST + '/cis/eadrax-membership/api/v2/joy-list');

        req.headers = {
            ...BMW_HEADERS,
            authorization: 'Bearer ' + accesstoken,
            'content-type': 'application/json; charset=utf-8'
        };

        req.method = 'POST';
        req.body = JSON.stringify({});

        const res = await req.loadJSON();
        if (res.code >= 200 && res.code < 300) {
            let message = `签到成功，当前共${res.data.joyCoin || 0} JOY币， ${res.data.joySocialHeader}`;
            console.log(message);
            this.notify('My BMW签到', message);
        }
    }

    async fakeShareToGetMoreCoin(accesstoken) {
        console.log('Start to fake post');

        let req = new Request(BMW_SERVER_HOST + '/cis/eadrax-ocommunity/public-api/v1/article-list');
        req.headers = {
            ...BMW_HEADERS,
            authorization: 'Bearer ' + accesstoken,
            'content-type': 'application/json; charset=utf-8'
        };

        req.method = 'POST';
        req.body = JSON.stringify({pageNum: 1, pageSize: 1, boardCode: 0});

        const res = await req.loadJSON();

        if (Number(res.code) >= 200 && Number(res.code) <= 300) {
            if (!res.data || !res.data.articleVos || !res.data.articleVos[0] || !res.data.articleVos[0].articleId) {
                throw 'No article found';
            }

            // then fake post article to get Joy coin
            req = new Request(BMW_SERVER_HOST + '/cis/eadrax-oarticle/open/article/api/v2/share-article');

            req.headers = {
                ...BMW_HEADERS,
                authorization: 'Bearer ' + accesstoken,
                'content-type': 'application/json; charset=utf-8'
            };

            req.method = 'POST';
            req.body = JSON.stringify({articleId: res.data.articleVos[0].articleId});

            const result = await req.loadJSON();

            return !!result;
        }

        return false;
    }

    async getBmwOfficialImage(data, useCache = true) {
        let url = `${BMW_SERVER_HOST}/eadrax-ics/v3/presentation/vehicles/${data.vin}/images?carView=VehicleStatus`;

        const cacheKey = this.md5(url);
        const cacheFile = FileManager.local().joinPath(FileManager.local().temporaryDirectory(), cacheKey);

        if (useCache && FileManager.local().fileExists(cacheFile)) {
            return Image.fromFile(cacheFile);
        }

        try {
            let accesstoken = '';
            if (Keychain.contains(MY_BMW_TOKEN)) {
                accesstoken = Keychain.get(MY_BMW_TOKEN);
            } else {
                throw new Error('没有token');
            }

            let req = new Request(url);

            req.method = 'GET';
            req.headers = {
                ...BMW_HEADERS,
                authorization: 'Bearer ' + accesstoken
            };

            const img = await req.loadImage();

            // 存储到缓存
            FileManager.local().writeImage(cacheFile, img);

            return img;
        } catch (e) {
            return this.loadDefaultImage();
        }
    }

    async getVehicleImage(data) {
        let imageCar = '';

        if (this.userConfigData.custom_vehicle_image) {
            try {
                imageCar = await this.getImageByUrl(this.userConfigData.custom_vehicle_image);
            } catch (e) {
                return this.loadDefaultImage();
            }
        } else {
            imageCar = await this.getBmwOfficialImage(data);
        }

        return imageCar;
    }

    async loadDefaultImage() {
        let defaultImage =
            'iVBORw0KGgoAAAANSUhEUgAAAlgAAAD3CAYAAADBsyrOAAAAAXNSR0IArs4c6QAAAKRlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgExAAIAAAAfAAAAWodpAAQAAAABAAAAegAAAAAAAAEsAAAAAQAAASwAAAABQWRvYmUgUGhvdG9zaG9wIDIwMjEgTWFjaW50b3NoAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAACWKADAAQAAAABAAAA9wAAAADO55/aAAAACXBIWXMAAC4jAAAuIwF4pT92AAAE62lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgICAgICAgICB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkFkb2JlIFBob3Rvc2hvcCAyMDIxIE1hY2ludG9zaDwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wTU06RGVyaXZlZEZyb20gcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICA8c3RSZWY6aW5zdGFuY2VJRD54bXAuaWlkOjhhODNmMGE3LTA4MWQtNDI4NS1hMTlkLWViMTgyZjU1YjA5MDwvc3RSZWY6aW5zdGFuY2VJ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';

        let imageData = Data.fromBase64String(defaultImage);

        return Image.fromData(imageData);
    }

    getFont(fontName, fontSize) {
        if (fontName == 'SF UI Display') {
            return Font.systemFont(fontSize);
        }

        if (fontName == 'SF UI Display Bold') {
            return Font.semiboldSystemFont(fontSize);
        }
        return new Font(fontName, fontSize);
    }
}

await Running(Widget)