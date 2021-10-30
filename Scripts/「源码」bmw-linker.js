// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: comments;
//
// iOS 桌面组件脚本 @「小件件」
// 开发说明：请从 Widget 类开始编写，注释请勿修改
// https://x.im3x.cn
//

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const {Base} = require('./「小件件」开发环境');

// @组件代码开始
let WIDGET_VERSION = 'v1.5';
let WIDGET_FONT = 'AppleSDGothicNeo';

class Widget extends Base {
    MY_BMW_REFRESH_TOKEN = 'MY_BMW_REFRESH_TOKEN';
    MY_BMW_TOKEN = 'MY_BMW_TOKEN';
    MY_BMW_UPDATE_AT = 'MY_BMW_UPDATE_AT';
    MY_BMW_CHECKIN_AT = 'MY_BMW_CHECKIN_AT';
    MY_BMW_AGREE = 'MY_BMW_AGREE';
    DeviceSize = {
        '428x926': {small: 176, medium: [374, 176], large: [374, 391]},
        '390x844': {small: 161, medium: [342, 161], large: [342, 359]},
        '414x896': {small: 169, medium: [360, 169], large: [360, 376]},
        '375x812': {small: 155, medium: [329, 155], large: [329, 345]},
        '414x736': {small: 159, medium: [348, 159], large: [348, 357]},
        '375x667': {small: 148, medium: [322, 148], large: [322, 324]},
        '320x568': {small: 141, medium: [291, 141], large: [291, 299]}
    };

    /**
     * 传递给组件的参数，可以是桌面 Parameter 数据，也可以是外部如 URLScheme 等传递的数据
     * @param {string} arg 自定义参数
     */
    constructor(arg) {
        super(arg);
        this.name = 'My BMW';
        this.desc = '宝马互联App小组件';
        this.en = 'UserConfig';
        this.defaultData = {...this.defaultData, ...this.settings[this.en]};
        if (config.runsInApp) {
            this.registerAction('配置用户', this.setWidgetUserConfig);
        }
    }

    defaultData = {
        username: '',
        password: '',
        custom_name: '',
        custom_car_image: null,
        custom_logo_image: null,
        vin: ''
    };

    setWidgetUserConfig = async () => {
        const b = new Alert();
        b.title = '警告⚠️';
        b.message = `本插件依赖于BMW账号体系工作\r\n首次登录需要您授权账号和密码进行令牌获取\r\n请妥善保管您的用户信息，插件作者不承担任何法律责任`;
        b.addAction('同意');
        b.addCancelAction('不同意');
        const idb = await b.presentAlert();
        if (idb === -1) {
            console.log('不同意');
            Keychain.set(this.MY_BMW_AGREE, 'false');
            return;
        } else {
            Keychain.set(this.MY_BMW_AGREE, 'true');
        }
        const a = new Alert();
        a.title = 'My BMW';
        a.message = '配置My BMW账号密码';
        a.addTextField('账号86+您的电话', this.defaultData.username);
        a.addSecureTextField('密码（不要有特殊字符）', this.defaultData.password);
        a.addTextField('自定义车名', this.defaultData.custom_name);
        a.addTextField('自定义车辆图片（URL）', this.defaultData.custom_car_image);
        a.addTextField('自定义LOGO（URL）', this.defaultData.custom_logo_image);
        a.addTextField('车架号(多辆BMW时填写)', this.defaultData.vin);
        a.addAction('确定');
        a.addCancelAction('取消');
        const id = await a.presentAlert();
        if (id === -1) return;
        this.defaultData.username = a.textFieldValue(0);
        this.defaultData.password = a.textFieldValue(1);
        this.defaultData.custom_name = a.textFieldValue(2);
        this.defaultData.custom_car_image = a.textFieldValue(3);
        this.defaultData.custom_logo_image = a.textFieldValue(4);
        this.defaultData.vin = a.textFieldValue(5);

        // 保存到本地
        this.settings[this.en] = this.defaultData;
        this.saveSettings();
    };

    /**
     * 渲染函数，函数名固定
     * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
     */
    async render() {
        await this.renderError('载入中...');
        if (this.defaultData.username === '') {
            console.error('尚未配置用户');
            return await this.renderError('请先配置用户');
        }
        let size = Device.screenSize();
        const data = await this.getData();
        if (data === null) {
            return await this.renderError('请确认授权');
        }
        try {
            data.size = this.DeviceSize[`${size.width}x${size.height}`] || this.DeviceSize['375x812'];
        } catch (e) {
            console.warn(e);
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
        let logoURL = 'https://s3.bmp.ovh/imgs/2021/10/a687f0e4702c1607.png';

        if (this.defaultData.custom_logo_image) {
            logoURL = this.defaultData.custom_logo_image;
        }

        return await this.getImageByUrl(logoURL);
    }

    async renderError(errMsg) {
        let w = new ListWidget();
        const bgColor = new LinearGradient();
        bgColor.colors = [new Color('#1c1c1c'), new Color('#29323c')];
        bgColor.locations = [0.0, 1.0];
        w.backgroundGradient = bgColor;
        const padding = 16;
        w.setPadding(padding, padding, padding, padding);
        w.addStack().addText(errMsg);
        return w;
    }

    /**
     * 渲染小尺寸组件
     */

    getBack() {
        const bgColor = new LinearGradient();
        let startColor = Color.dynamic(Color.white(), new Color('#1c1c1c'));
        let endColor = Color.dynamic(Color.white(), new Color('#1c1c1c'));
        bgColor.colors = [startColor, endColor];
        bgColor.locations = [0.0, 1.0];
        return bgColor;
    }

    async renderSmall(data) {
        let w = new ListWidget();

        const width = data.size.small;

        let fontColor = Color.dynamic(new Color('#2B2B2B'), Color.white());
        w.backgroundGradient = this.getBack();

        w.setPadding(0, 0, 0, 2);
        const {levelValue, levelUnits, rangeValue, rangeUnits} = data.status.fuelIndicators[0];

        // 第一行右边车辆名称 左边logo
        const topBox = w.addStack();
        topBox.layoutHorizontally();
        topBox.setPadding(6, 12, 0, 0);

        // ---顶部左边部件---
        const topLeftBox = topBox.addStack();
        const carNameBox = topLeftBox.addStack();

        carNameBox.setPadding(0, 0, 0, 0);

        let carName = `${data.bodyType} ${data.model}`;
        if (this.defaultData.custom_name.length > 0) {
            carName = this.defaultData.custom_name;
        }
        const carNameTxt = carNameBox.addText(carName);
        carNameTxt.leftAlignText();
        carNameTxt.font = this.provideFont(`${WIDGET_FONT}-Bold`, 16);
        carNameTxt.textColor = fontColor;
        // ---顶部左边部件完---

        topBox.addSpacer();

        // ---顶部右边部件---
        const topRightBox = topBox.addStack();
        topRightBox.layoutVertically();
        topRightBox.size = new Size(width * 0.35, 0);

        try {
            const logoContainer = topRightBox.addStack();
            logoContainer.setPadding(0, 0, 0, 6);

            let logoImage = logoContainer.addImage(await this.getAppLogo());
            logoImage.rightAlignImage();

            if (!this.defaultData.custom_logo_image) {
                logoImage.tintColor = fontColor;
            }
        } catch (e) {}
        // ---顶部右边部件完---

        // const versionContainer = topRightBox.addStack();
        // versionContainer.layoutHorizontally();
        // versionContainer.addSpacer();
        // versionContainer.setPadding(0, 0, 0, 6);

        // let versionText = versionContainer.addText(WIDGET_VERSION);
        // versionText.rightAlignText();

        // versionText.font = this.provideFont(`${WIDGET_FONT}-Regular`, 8);
        // versionText.textColor = fontColor;
        // versionText.textOpacity = 0.5;

        // ---中间部件---
        const carInfoContainer = w.addStack();
        carInfoContainer.layoutVertically();
        carInfoContainer.setPadding(14, 12, 0, 0);

        const remainKmBox = carInfoContainer.addStack();
        remainKmBox.layoutHorizontally();
        remainKmBox.topAlignContent();

        const remainKmTxt = remainKmBox.addText(`${rangeValue} ${rangeUnits}`);
        remainKmTxt.font = this.provideFont(`${WIDGET_FONT}-Bold`, 14);
        remainKmTxt.textColor = fontColor;
        const levelContainer = remainKmBox.addStack();
        levelContainer.setPadding(0, 2, 0, 2);
        const remainKmUnitTxt = levelContainer.addText(`/ ${levelValue}${levelUnits}`);
        remainKmUnitTxt.font = this.provideFont(`${WIDGET_FONT}-Regular`, 14);
        remainKmUnitTxt.textColor = fontColor;
        remainKmUnitTxt.textOpacity = 0.7;

        const carStatusContainer = carInfoContainer.addStack();
        carStatusContainer.setPadding(2, 0, 0, 0);

        const carStatusBox = carStatusContainer.addStack();
        carStatusBox.setPadding(3, 3, 3, 3);
        carStatusBox.layoutHorizontally();
        carStatusBox.centerAlignContent();
        carStatusBox.cornerRadius = 4;
        carStatusBox.backgroundColor = Color.dynamic(new Color('#f1f1f8', 0.8), new Color('#2c2c2c', 0.8));
        const carStatusTxt = carStatusBox.addText(`${data.status.doorsGeneralState}`);
        carStatusTxt.font = this.provideFont(`${WIDGET_FONT}-Regular`, 10);
        carStatusTxt.textColor = fontColor;
        carStatusTxt.textOpacity = 0.7;
        carStatusBox.addSpacer(5);
        const updateTxt = carStatusBox.addText(
            `${data.status.timestampMessage.replace('已从车辆更新', '').split(' ')[1] + '更新'}`
        );
        updateTxt.font = this.provideFont(`${WIDGET_FONT}-Regular`, 10);
        updateTxt.textColor = fontColor;
        updateTxt.textOpacity = 0.5;
        // ---中间部件完---

        w.addSpacer();

        // ---底部部件---
        const bottomBox = w.addStack();

        bottomBox.setPadding(8, 12, 12, 10); // 图片的边距
        bottomBox.addSpacer();

        const carImageBox = bottomBox.addStack();
        carImageBox.bottomAlignContent();

        try {
            let imageCar = await this.getCarImage(data);
            let carImage = carImageBox.addImage(imageCar);
            carImage.rightAlignImage();
        } catch (e) {}
        // ---底部部件完---

        w.url = 'de.bmw.connected.mobile20.cn://'; // BASEURL + encodeURI(SHORTCUTNAME);

        return w;
    }

    /**
     * 渲染中尺寸组件
     */
    async renderMedium(data) {
        let w = new ListWidget();
        let fontColor = Color.dynamic(new Color('#2B2B2B'), Color.white());
        w.backgroundGradient = this.getBack();

        w.setPadding(0, 0, 0, 2);
        const width = data.size.medium[0];
        const height = data.size.medium[1];

        const bodyBox = w.addStack();

        bodyBox.setPadding(0, 0, 0, 0);
        bodyBox.layoutHorizontally();
        const leftBox = bodyBox.addStack();
        leftBox.layoutVertically();
        leftBox.size = new Size(width * 0.5, height);

        const carNameDom = leftBox.addStack();
        carNameDom.setPadding(8, 14, 0, 0);

        let carName = `${data.brand} ${data.model}`;
        if (this.defaultData.custom_name.length > 0) {
            carName = this.defaultData.custom_name;
        }
        const carNameText = carNameDom.addText(carName);
        carNameText.font = this.provideFont(`${WIDGET_FONT}-Bold`, 16);
        carNameText.textColor = fontColor;
        carNameDom.addSpacer();

        const kmBox = leftBox.addStack();
        kmBox.setPadding(20, 14, 0, 0);
        const {levelValue, levelUnits, rangeValue, rangeUnits} = data.status.fuelIndicators[0];
        const kmText = kmBox.addText(`${rangeValue + ' ' + rangeUnits}`);
        kmText.font = this.provideFont(`${WIDGET_FONT}-Bold`, 16);
        kmText.textColor = fontColor;

        const levelContainer = kmBox.addStack();
        levelContainer.setPadding(4, 4, 0, 0);
        const levelText = levelContainer.addText(`/${levelValue}${levelUnits}`);
        levelText.font = this.provideFont(`${WIDGET_FONT}-Regular`, 12);
        levelText.textColor = fontColor;
        levelText.textOpacity = 0.7;

        const carStatusContainer = leftBox.addStack();
        carStatusContainer.setPadding(8, 14, 0, 0);

        const carStatusBox = carStatusContainer.addStack();
        carStatusBox.setPadding(3, 3, 3, 3);
        carStatusBox.layoutHorizontally();
        carStatusBox.centerAlignContent();
        carStatusBox.cornerRadius = 4;
        carStatusBox.backgroundColor = Color.dynamic(new Color('#f1f1f8', 0.8), new Color('#2c2c2c', 0.8));
        const carStatusTxt = carStatusBox.addText(`${data.status.doorsGeneralState}`);
        carStatusTxt.font = this.provideFont(`${WIDGET_FONT}-Regular`, 10);
        carStatusTxt.textColor = fontColor;
        carStatusTxt.textOpacity = 0.7;
        carStatusBox.addSpacer(5);
        const updateTxt = carStatusBox.addText(
            `${data.status.timestampMessage.replace('已从车辆更新', '').split(' ')[1] + '更新'}`
        );
        updateTxt.font = this.provideFont(`${WIDGET_FONT}-Regular`, 10);
        updateTxt.textColor = fontColor;
        updateTxt.textOpacity = 0.5;

        let locationStr = '';
        let latLng = '';
        try {
            locationStr = data.properties.vehicleLocation.address.formatted;
            latLng =
                data.properties.vehicleLocation.coordinates.longitude +
                ',' +
                data.properties.vehicleLocation.coordinates.latitude;
        } catch (e) {}

        leftBox.addSpacer();

        const locationContainer = leftBox.addStack();
        locationContainer.setPadding(16, 14, 16, 2);

        const locationText = locationContainer.addText(locationStr);
        locationText.font = this.provideFont(`${WIDGET_FONT}-Regular`, 10);
        locationText.textColor = fontColor;
        locationText.textOpacity = 0.5;
        locationText.url = `http://maps.apple.com/?address=${encodeURI(locationStr)}&ll=${latLng}&t=m`;

        const rightBox = bodyBox.addStack();
        rightBox.setPadding(8, 0, 0, 8);
        rightBox.layoutVertically();
        rightBox.size = new Size(width * 0.5, height);

        const logoImageContainer = rightBox.addStack();
        logoImageContainer.addSpacer();

        try {
            let logoImage = logoImageContainer.addImage(await this.getAppLogo());
            logoImage.rightAlignImage();
            if (!this.defaultData.custom_logo_image) {
                logoImage.tintColor = fontColor;
            }
        } catch (e) {}

        // const versionContainer = rightBox.addStack();
        // versionContainer.layoutHorizontally();
        // versionContainer.addSpacer();

        // let versionText = versionContainer.addText(WIDGET_VERSION);
        // versionText.rightAlignText();
        // versionText.font = this.provideFont(`${WIDGET_FONT}-Regular`, 8);

        const carImageContainer = rightBox.addStack();
        carImageContainer.setPadding(8, 0, 0, 8);
        carImageContainer.size = new Size(width * 0.5, height - 38);
        carImageContainer.bottomAlignContent();

        try {
            let imageCar = await this.getCarImage(data);
            let carImage = carImageContainer.addImage(imageCar);
            carImage.rightAlignImage();
        } catch (e) {}

        rightBox.addSpacer();

        w.url = 'de.bmw.connected.mobile20.cn://';

        return w;
    }

    /**
     * 渲染大尺寸组件
     */
    async renderLarge(data) {
        return await this.renderMedium(data, 10);
    }

    /**
     * 获取数据函数，函数名可不固定
     */
    async getData() {
        let accessToken = await this.getAccessToken();
        if (accessToken === '') {
            return null;
        }

        try {
            await this.checkInDaily(accessToken);
        } catch (e) {}

        const data = await this.getVIN(accessToken);
        return data;
    }

    /**
     * 自定义注册点击事件，用 actionUrl 生成一个触发链接，点击后会执行下方对应的 action
     * @param {string} url 打开的链接
     */
    async actionOpenUrl(url) {
        Safari.openInApp(url, false);
    }

    async getPublicKey() {
        const req = new Request('https://myprofile.bmw.com.cn/eadrax-coas/v1/cop/publickey');
        req.headers = {
            'user-agent': 'Dart/2.10 (dart:io)',
            'x-user-agent': 'ios(14.3);bmw;1.5.0(8954)',
            'accept-language': 'zh_CN',
            host: 'myprofile.bmw.com.cn',
            'x-cluster-use-mock': 'never',
            '24-hour-format': 'true'
        };
        const res = await req.loadJSON();
        if (res.code === 200 && res.data.value) {
            console.log('加密公钥获取成功');
            return res.data.value;
        } else {
            console.log('加密公钥获取失败');
            return null;
        }
    }

    async getAccessToken() {
        let accessToken = '';
        if (Keychain.contains(this.MY_BMW_UPDATE_AT)) {
            let lastUpdate = parseInt(Keychain.get(this.MY_BMW_UPDATE_AT));
            console.log(this.timeFormat('yyyy-MM-dd HH:mm:ss', lastUpdate));
            if (lastUpdate > new Date().valueOf() - 1000 * 60 * 55) {
                console.warn('[-] token有效 暂定55分钟');
                if (Keychain.contains(this.MY_BMW_TOKEN)) {
                    accessToken = Keychain.get(this.MY_BMW_TOKEN);
                }
            } else {
                if (Keychain.contains(this.MY_BMW_REFRESH_TOKEN)) {
                    let refresh_token = Keychain.get(this.MY_BMW_REFRESH_TOKEN);
                    // 刷新token
                    accessToken = await this.refreshToken(refresh_token);
                }
            }
        }
        if (accessToken === '') {
            console.log('token 无效或不存在，重新获取token');
            const loginRes = await this.myLogin();
            if (loginRes !== null) {
                const {access_token, refresh_token, token_type} = loginRes;
                accessToken = access_token;
                Keychain.set(this.MY_BMW_UPDATE_AT, String(new Date().valueOf()));
                Keychain.set(this.MY_BMW_TOKEN, accessToken);
                Keychain.set(this.MY_BMW_REFRESH_TOKEN, refresh_token);
            } else {
                accessToken = '';
            }
        }
        return accessToken;
    }

    async refreshToken(refresh_token) {
        console.log('token 过期，但是有刷新token');
        const req = new Request('https://myprofile.bmw.com.cn/eadrax-coas/v1/oauth/token');
        req.headers = {
            'user-agent': 'Dart/2.10 (dart:io)',
            'x-user-agent': 'ios(14.3);bmw;1.5.0(8954)',
            authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhYzRkZTdmYi00ZTg3LTQ3MjctOTNkNS1jMDY1MzMwYmI3ZTgkMSRBJDE2Mjc0ODA0NTExNjciLCJuYmYiOjE2Mjc0ODA0NTEsImV4cCI6MTYyNzQ4Mzc1MSwiaWF0IjoxNjI3NDgwNDUxfQ.bX_KZbSzVYnM9ht8S9Cu__Kawg6XsEcpn-qA7YRi4GA',
            'content-type': 'application/json; charset=utf-8',
            'accept-language': 'zh-CN',
            host: 'myprofile.bmw.com.cn',
            'x-cluster-use-mock': 'never',
            '24-hour-format': 'true'
        };
        req.method = 'POST';
        req.body = `grant_type=refresh_token&refresh_token=${refresh_token}`;
        const res = await req.loadJSON();

        if (res.access_token !== undefined) {
            const {access_token, refresh_token} = res;
            Keychain.set(this.MY_BMW_UPDATE_AT, String(new Date().valueOf()));
            Keychain.set(this.MY_BMW_TOKEN, access_token);
            Keychain.set(this.MY_BMW_REFRESH_TOKEN, refresh_token);
            return access_token;
        } else {
            return '';
        }
    }

    async myLogin() {
        console.log('获取登录凭证');
        const _password = await this.getEncryptedPassword();
        let req = new Request('https://myprofile.bmw.com.cn/eadrax-coas/v1/login/pwd');

        req.method = 'POST';

        req.body = JSON.stringify({
            mobile: this.defaultData.username,
            password: _password
        });

        req.headers = {
            'user-agent': 'Dart/2.10 (dart:io)',
            'x-user-agent': 'ios(14.3);bmw;1.5.0(8954)',
            host: 'myprofile.bmw.com.cn'
        };

        const res = await req.loadJSON();
        if (res.code === 200) {
            return res.data;
        } else {
            console.log('获取token异常');
            console.log(res);
            console.log(req.response);
            return null;
        }
    }

    async getEncryptedPassword() {
        let publicKey = await this.getPublicKey();

        let req = new Request('https://www.bejson.com/Bejson/Api/Rsa/pubEncrypt');

        req.method = 'POST';
        req.headers = {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };

        req.addParameterToMultipart('publicKey', publicKey);
        req.addParameterToMultipart('encStr', this.defaultData.password);
        req.addParameterToMultipart('etype', 'rsa1');

        const res = await req.loadJSON();
        if (res.code === 200) {
            return res.data;
        } else {
            console.log('获取EncryptedPassword异常');
            console.log(res);
            return await this.renderError('获取EncryptedPassword异常');
        }
    }

    async getVIN(access_token) {
        console.log('开始获取车辆信息');
        const req = new Request(
            `https://myprofile.bmw.com.cn/eadrax-vcs/v1/vehicles?apptimezone=480&appDateTime=${new Date().valueOf()}`
        );
        req.headers = {
            'user-agent': 'Dart/2.10 (dart:io)',
            'x-user-agent': 'ios(14.3);bmw;1.5.0(8954)',
            authorization: 'Bearer ' + access_token,
            'content-type': 'application/json; charset=utf-8',
            'accept-language': 'zh-CN',
            host: 'myprofile.bmw.com.cn',
            'x-cluster-use-mock': 'never',
            '24-hour-format': 'true'
        };
        const res = await req.loadJSON();
        let vin = this.defaultData.vin;
        if (res instanceof Array) {
            console.log('车辆信息获取成功');
            if (vin && vin.length > 0) {
                let vinLow = vin.toLowerCase();
                let findVin = res.filter((p) => p.vin.toLowerCase() === vinLow);
                if (findVin.length === 0) {
                    findVin = res[0];
                }
                return findVin[0];
            } else {
                return res[0];
            }
        } else {
            console.log(res);
            return null;
        }
    }

    async checkInDaily(access_token) {
        let today = this.timeFormat('yyyyMMdd');
        console.log(today);
        let hasCheckIn = false;
        if (Keychain.contains(this.MY_BMW_CHECKIN_AT)) {
            const lastCheckIn = Keychain.get(this.MY_BMW_CHECKIN_AT);
            console.log(lastCheckIn);
            if (lastCheckIn === today) {
                hasCheckIn = true;
                console.log('已经签到过了');
            }
        }
        if (!hasCheckIn) {
            console.log('开始签到');
            const req = new Request('https://myprofile.bmw.com.cn/cis/eadrax-community/private-api/v1/mine/check-in');
            req.headers = {
                'user-agent': 'Dart/2.10 (dart:io)',
                'x-user-agent': 'ios(14.3);bmw;1.5.0(8954)',
                authorization: 'Bearer ' + access_token,
                'content-type': 'application/json; charset=utf-8',
                'accept-language': 'zh-CN',
                host: 'myprofile.bmw.com.cn',
                'x-cluster-use-mock': 'never',
                '24-hour-format': 'true'
            };
            req.method = 'POST';
            req.body = JSON.stringify({signDate: null});
            const res = await req.loadJSON();
            Keychain.set(this.MY_BMW_CHECKIN_AT, today);
            console.log(res);
            const n = new Notification();
            n.title = '签到';
            n.body = res.message;
            n.schedule();
        }
    }

    /**
     * 获取远程图片内容
     * @param {string} url 图片地址
     * @param {bool} useCache 是否使用缓存（请求失败时获取本地缓存）
     */
    async getBmwImage(url, useCache = true) {
        // https://myprofile.bmw.com.cn/eadrax-ics/v3/presentation/vehicles/WBAJR3103LCD51742/images?carView=VehicleStatus
        const cacheKey = this.md5(url);
        const cacheFile = FileManager.local().joinPath(FileManager.local().temporaryDirectory(), cacheKey);
        // 判断是否有缓存
        if (useCache && FileManager.local().fileExists(cacheFile)) {
            return Image.fromFile(cacheFile);
        }
        try {
            let access_token = '';
            if (Keychain.contains(this.MY_BMW_TOKEN)) {
                access_token = Keychain.get(this.MY_BMW_TOKEN);
            } else {
                throw new Error('没有token');
            }
            const req = new Request(url);
            req.method = 'GET';
            req.headers = {
                'user-agent': 'Dart/2.10 (dart:io)',
                'x-user-agent': 'ios(14.3);bmw;1.5.0(8954)',
                authorization: 'Bearer ' + access_token,
                'accept-language': 'zh-CN',
                host: 'myprofile.bmw.com.cn',
                'x-cluster-use-mock': 'never',
                '24-hour-format': 'true'
            };
            const img = await req.loadImage();
            // 存储到缓存
            FileManager.local().writeImage(cacheFile, img);
            return img;
        } catch (e) {
            // 没有缓存+失败情况下，返回自定义的绘制图片（红色背景）
            let ctx = new DrawContext();
            ctx.size = new Size(100, 100);
            ctx.setFillColor(Color.red());
            ctx.fillRect(new Rect(0, 0, 100, 100));
            return await ctx.getImage();
        }
    }

    async getCarImage(data) {
        let imageCar = '';
        let carImageUrl = `https://myprofile.bmw.com.cn/eadrax-ics/v3/presentation/vehicles/${data.vin}/images?carView=VehicleStatus`;
        if (this.defaultData.custom_car_image) {
            imageCar = await this.getImageByUrl(this.defaultData.custom_car_image);
        } else {
            imageCar = await this.getBmwImage(carImageUrl);
        }

        return imageCar;
    }

    timeFormat(fmt, ts = null) {
        const date = ts ? new Date(ts) : new Date();
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'H+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            S: date.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        for (let k in o)
            if (new RegExp('(' + k + ')').test(fmt))
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        return fmt;
    }

    /**
     * @description Provide a font based on the input.
     * @param {*} fontName
     * @param {*} fontSize
     */
    provideFont(fontName, fontSize) {
        const fontGenerator = {
            ultralight: function () {
                return Font.ultraLightSystemFont(fontSize);
            },
            light: function () {
                return Font.lightSystemFont(fontSize);
            },
            regular: function () {
                return Font.regularSystemFont(fontSize);
            },
            medium: function () {
                return Font.mediumSystemFont(fontSize);
            },
            semibold: function () {
                return Font.semiboldSystemFont(fontSize);
            },
            bold: function () {
                return Font.boldSystemFont(fontSize);
            },
            heavy: function () {
                return Font.heavySystemFont(fontSize);
            },
            black: function () {
                return Font.blackSystemFont(fontSize);
            },
            italic: function () {
                return Font.italicSystemFont(fontSize);
            }
        };

        const systemFont = fontGenerator[fontName];
        if (systemFont) {
            return systemFont();
        }
        return new Font(fontName, fontSize);
    }
}
// @组件代码结束

const {Testing} = require('./「小件件」开发环境');
await Testing(Widget);
