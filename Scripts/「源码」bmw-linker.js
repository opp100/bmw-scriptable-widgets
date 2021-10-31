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
let WIDGET_VERSION = 'v1.6';
let WIDGET_FONT = 'AvenirNext';
let BMW_SERVER_HOST = 'https://myprofile.bmw.com.cn';

let DEFAULT_BG_COLOR_LIGHT = '#FFFFFF';
let DEFAULT_BG_COLOR_DARK = '#2B2B2B';

class Widget extends Base {
    MY_BMW_REFRESH_TOKEN = 'MY_BMW_REFRESH_TOKEN';
    MY_BMW_TOKEN = 'MY_BMW_TOKEN';
    MY_BMW_UPDATE_AT = 'MY_BMW_UPDATE_AT';
    MY_BMW_LAST_CHECK_IN = 'MY_BMW_LAST_CHECK_IN';
    MY_BMW_AGREE = 'MY_BMW_AGREE';

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

    constructor(arg) {
        super(arg);
        this.name = 'My BMW';
        this.desc = '宝马互联App小组件';
        this.configKeyName = 'UserConfig';

        this.defaultData = {...this.defaultData, ...this.settings[this.configKeyName]};
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
        vin: '',
        map_api_key: null
    };

    setWidgetUserConfig = async () => {
        const b = new Alert();

        b.title = '郑重声明';
        b.message = `小组件需要使用到您的BMW账号\n\r\n首次登录请配置账号、密码进行令牌获取\n\r\n本组件不会收集您的个人账户信息，所有账号信息将存在iCloud或者iPhone上但也请您妥善保管自己的账号`;

        b.addAction('同意');
        b.addCancelAction('不同意');

        const idb = await b.presentAlert();
        if (idb === -1) {
            console.log('User denied');
            Keychain.set(this.MY_BMW_AGREE, 'false');
            return;
        } else {
            Keychain.set(this.MY_BMW_AGREE, 'true');
        }

        const _alert = new Alert();
        _alert.title = 'My BMW';
        _alert.message = '配置My BMW账号密码';

        _alert.addTextField('账号86+您的电话', this.defaultData.username);
        _alert.addSecureTextField('密码（不要有特殊字符）', this.defaultData.password);
        _alert.addTextField('自定义车名', this.defaultData.custom_name);
        _alert.addTextField('自定义车辆图片（URL）', this.defaultData.custom_car_image);
        _alert.addTextField('自定义LOGO（URL）', this.defaultData.custom_logo_image);
        _alert.addTextField('车架号(多辆BMW时填写)', this.defaultData.vin);
        _alert.addTextField('高德API(选填)', this.defaultData.map_api_key);

        _alert.addAction('确定');
        _alert.addCancelAction('取消');

        const id = await _alert.presentAlert();

        if (id == -1) {
            return;
        }

        // start to get data
        this.defaultData.username = _alert.textFieldValue(0);
        this.defaultData.password = _alert.textFieldValue(1);
        this.defaultData.custom_name = _alert.textFieldValue(2);
        this.defaultData.custom_car_image = _alert.textFieldValue(3);
        this.defaultData.custom_logo_image = _alert.textFieldValue(4);
        this.defaultData.vin = _alert.textFieldValue(5);
        this.defaultData.map_api_key = _alert.textFieldValue(6);

        // write to local
        this.settings[this.configKeyName] = this.defaultData;
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
        let screenSize = Device.screenSize();
        const data = await this.getData();
        if (data === null) {
            return await this.renderError('请确认授权');
        }
        try {
            data.size = this.DeviceSize[`${screenSize.width}x${screenSize.height}`] || this.DeviceSize['375x812'];
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
        let logoURL = 'https://z3.ax1x.com/2021/10/31/ISfUSS.png';

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

        bgColor.colors = [
            Color.dynamic(new Color(DEFAULT_BG_COLOR_LIGHT, 1), new Color(DEFAULT_BG_COLOR_DARK, 1)),
            Color.dynamic(new Color(DEFAULT_BG_COLOR_LIGHT, 1), new Color(DEFAULT_BG_COLOR_DARK, 1))
        ];

        bgColor.locations = [0, 1];

        return bgColor;
    }

    async renderSmall(data) {
        let w = new ListWidget();
        let fontColor = Color.dynamic(new Color('#2B2B2B'), Color.white());
        w.backgroundGradient = this.getBack();

        const width = data.size['small']['width'];

        w.setPadding(0, 0, 0, 2);
        const {levelValue, levelUnits, rangeValue, rangeUnits} = data.status.fuelIndicators[0];

        // 第一行右边车辆名称 左边logo
        const topBox = w.addStack();
        topBox.layoutHorizontally();
        topBox.setPadding(6, 12, 0, 0);

        // ---顶部左边部件---
        const topleftContainer = topBox.addStack();
        const carNameBox = topleftContainer.addStack();

        carNameBox.setPadding(0, 0, 0, 0);

        let carName = `${data.brand} ${data.model}`;
        if (this.defaultData.custom_name.length > 0) {
            carName = this.defaultData.custom_name;
        }
        const carNameText = carNameBox.addText(carName);
        carNameText.leftAlignText();
        carNameText.font = this.getFont(`${WIDGET_FONT}-DemiBold`, 14);
        carNameText.textColor = fontColor;
        // ---顶部左边部件完---

        topBox.addSpacer();

        // ---顶部右边部件---
        const topRightBox = topBox.addStack();
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

        // ---中间部件---
        const carInfoContainer = w.addStack();
        carInfoContainer.layoutVertically();
        carInfoContainer.setPadding(14, 12, 0, 0);

        const kmContainer = carInfoContainer.addStack();
        kmContainer.layoutHorizontally();
        kmContainer.bottomAlignContent();

        const remainKmTxt = kmContainer.addText(`${rangeValue} ${rangeUnits}`);
        remainKmTxt.font = this.getFont(`${WIDGET_FONT}-Bold`, 14);
        remainKmTxt.textColor = fontColor;
        const levelContainer = kmContainer.addStack();
        levelContainer.setPadding(0, 2, 0, 2);
        const levelText = levelContainer.addText(`/ ${levelValue}${levelUnits}`);
        levelText.font = this.getFont(`${WIDGET_FONT}-Regular`, 13);
        levelText.textColor = fontColor;
        levelText.textOpacity = 0.7;

        const carStatusContainer = carInfoContainer.addStack();
        carStatusContainer.setPadding(2, 0, 0, 0);

        const carStatusBox = carStatusContainer.addStack();
        carStatusBox.setPadding(3, 3, 3, 3);
        carStatusBox.layoutHorizontally();
        carStatusBox.centerAlignContent();
        carStatusBox.cornerRadius = 4;
        carStatusBox.backgroundColor = Color.dynamic(new Color('#f1f1f8', 0.8), new Color('#2c2c2c', 0.8));

        const carStatusTxt = carStatusBox.addText(`${data.status.doorsGeneralState}`);
        carStatusTxt.font = this.getFont(`${WIDGET_FONT}-Regular`, 10);
        carStatusTxt.textColor = fontColor;
        carStatusTxt.textOpacity = 0.7;
        carStatusBox.addSpacer(5);
        const updateTxt = carStatusBox.addText(
            `${data.status.timestampMessage.replace('已从车辆更新', '').split(' ')[1] + '更新'}`
        );
        updateTxt.font = this.getFont(`${WIDGET_FONT}-Regular`, 10);
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
            let imageCar = await this.getVehicleImage(data);
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
    async renderMedium(data, renderLarge = false) {
        let w = new ListWidget();
        let fontColor = Color.dynamic(new Color('#2B2B2B'), Color.white());
        w.backgroundGradient = this.getBack();

        w.setPadding(0, 0, 0, 0);
        const {width, height} = data.size['medium'];

        const bodyContainer = w.addStack();
        bodyContainer.setPadding(0, 0, 0, 0);
        bodyContainer.layoutHorizontally();

        const leftContainer = bodyContainer.addStack();
        leftContainer.layoutVertically();
        leftContainer.size = new Size(width * 0.5, height);

        const carNameContainer = leftContainer.addStack();
        carNameContainer.setPadding(8, 14, 0, 0);

        let carName = `${data.brand} ${data.model} ${data.bodyType}`;
        if (this.defaultData.custom_name.length > 0) {
            carName = this.defaultData.custom_name;
        }
        const carNameText = carNameContainer.addText(carName);
        carNameText.font = this.getFont(`${WIDGET_FONT}-DemiBold`, 20);
        carNameText.textColor = fontColor;
        carNameContainer.addSpacer();

        const kmContainer = leftContainer.addStack();
        kmContainer.setPadding(20, 14, 0, 0);
        kmContainer.bottomAlignContent();

        const {levelValue, levelUnits, rangeValue, rangeUnits} = data.status.fuelIndicators[0];
        const kmText = kmContainer.addText(`${rangeValue + ' ' + rangeUnits}`);
        kmText.font = this.getFont(`${WIDGET_FONT}-Bold`, 16);
        kmText.textColor = fontColor;

        const levelContainer = kmContainer.addStack();
        levelContainer.setPadding(0, 4, 0, 0);
        const levelText = levelContainer.addText(`/${levelValue}${levelUnits}`);
        levelText.font = this.getFont(`${WIDGET_FONT}-Regular`, 14);
        levelText.textColor = fontColor;
        levelText.textOpacity = 0.7;

        const mileageContainer = leftContainer.addStack();
        mileageContainer.setPadding(0, 14, 0, 0);

        let mileageText = mileageContainer.addText(
            `总里程: ${data.status.currentMileage.mileage} ${data.status.currentMileage.units}`
        );
        mileageText.font = this.getFont(`${WIDGET_FONT}-Regular`, 9);
        mileageText.textColor = fontColor;
        mileageText.textOpacity = 0.7;

        const carStatusContainer = leftContainer.addStack();
        carStatusContainer.setPadding(8, 14, 0, 0);

        const carStatusBox = carStatusContainer.addStack();
        carStatusBox.setPadding(3, 3, 3, 3);
        carStatusBox.layoutHorizontally();
        carStatusBox.centerAlignContent();
        carStatusBox.cornerRadius = 4;
        carStatusBox.backgroundColor = Color.dynamic(new Color('#f1f1f8', 0.8), new Color('#2c2c2c', 0.8));
        const carStatusTxt = carStatusBox.addText(`${data.status.doorsGeneralState}`);
        carStatusTxt.font = this.getFont(`${WIDGET_FONT}-Regular`, 10);
        carStatusTxt.textColor = fontColor;
        carStatusTxt.textOpacity = 0.7;
        carStatusBox.addSpacer(5);
        const updateTxt = carStatusBox.addText(
            `${data.status.timestampMessage.replace('已从车辆更新', '').split(' ')[1] + '更新'}`
        );
        updateTxt.font = this.getFont(`${WIDGET_FONT}-Regular`, 10);
        updateTxt.textColor = fontColor;
        updateTxt.textOpacity = 0.5;

        let locationStr = '';
        try {
            locationStr = data.properties.vehicleLocation.address.formatted;
        } catch (e) {}

        leftContainer.addSpacer();

        const locationContainer = leftContainer.addStack();
        locationContainer.setPadding(0, 14, 8, 2);

        const locationText = locationContainer.addText(locationStr);
        locationText.font = this.getFont(`${WIDGET_FONT}-Regular`, 10);
        locationText.textColor = fontColor;
        locationText.textOpacity = 0.5;
        locationText.url = this.buildMapURL(data);

        const rightContainer = bodyContainer.addStack();
        rightContainer.setPadding(8, 0, 0, 8);
        rightContainer.layoutVertically();
        rightContainer.size = new Size(Math.ceil(width * 0.5), height);

        const logoImageContainer = rightContainer.addStack();
        logoImageContainer.size = new Size(0, Math.ceil(height * 0.1));
        logoImageContainer.layoutHorizontally();

        logoImageContainer.setPadding(0, 8, 4, 0);

        logoImageContainer.addSpacer();

        try {
            let logoImage = logoImageContainer.addImage(await this.getAppLogo());
            logoImage.rightAlignImage();
            if (!this.defaultData.custom_logo_image) {
                logoImage.tintColor = fontColor;
            }
        } catch (e) {}

        rightContainer.addSpacer();

        const carImageContainer = rightContainer.addStack();
        carImageContainer.setPadding(0, 0, 0, 8);
        carImageContainer.size = new Size(Math.ceil(width * 0.5), Math.ceil(height * 0.45));

        carImageContainer.bottomAlignContent();

        try {
            let imageCar = await this.getVehicleImage(data);
            let carImage = carImageContainer.addImage(imageCar);
            carImage.rightAlignImage();
        } catch (e) {}

        if (data.status.doorsAndWindows && data.status.doorsAndWindows.length > 0) {
            let windowStatusContainer = rightContainer.addStack();
            windowStatusContainer.setPadding(0, 0, 8, 0);

            windowStatusContainer.layoutHorizontally();
            windowStatusContainer.addSpacer();

            let windowStatus = `${data.status.doorsAndWindows[0].title} ${data.status.doorsAndWindows[0].state} `;
            let windowStatusText = windowStatusContainer.addText(windowStatus);
            windowStatusText.font = this.getFont(`${WIDGET_FONT}-Regular`, 10);
            windowStatusText.textColor = fontColor;
            windowStatusText.textOpacity = 0.5;

            windowStatusContainer.addSpacer();
        }

        w.url = 'de.bmw.connected.mobile20.cn://';

        return w;
    }

    /**
     * 渲染大尺寸组件
     */
    async renderLarge(data) {
        let w = await this.renderMedium(data, true);
        const {width, height} = data.size['large'];
        w.setPadding(0, 0, 0, 0);
        w.addSpacer();

        let largeExtraContainer = w.addStack();
        largeExtraContainer.bottomAlignContent();

        let mapWidth = Math.ceil(width);
        let mapHeight = Math.ceil(height * 0.5);

        largeExtraContainer.size = new Size(mapWidth, mapHeight);

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

    async loadMapView(latLng, width, height, useCache = true) {
        try {
            if (!this.defaultData.map_api_key) {
                throw '获取地图失败，请检查API KEY';
            }

            width = parseInt(width);
            height = parseInt(height);

            let mapApiKey = this.defaultData.map_api_key;

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
            let ctx = new DrawContext();
            ctx.size = new Size(width, height);

            ctx.setFillColor(new Color('#eee'));
            ctx.fillRect(new Rect(0, 0, width, height));
            ctx.drawTextInRect(e.message || '获取地图失败', new Rect(20, 20, width, height));

            return await ctx.getImage();
        }
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
        let req = new Request(BMW_SERVER_HOST + '/eadrax-coas/v1/cop/publickey');
        req.headers = {
            'user-agent': 'Dart/2.10 (dart:io)',
            'x-user-agent': 'ios(15.0.2);bmw;1.5.0(8954)',
            host: 'myprofile.bmw.com.cn',
            'x-cluster-use-mock': 'never',
            '24-hour-format': 'true'
        };
        const res = await req.loadJSON();
        if (res.code === 200 && res.data.value) {
            console.log('Getting public key success');
            return res.data.value;
        } else {
            console.log('Getting public key failed');
            return null;
        }
    }

    async getAccessToken() {
        let accessToken = '';
        if (Keychain.contains(this.MY_BMW_UPDATE_AT)) {
            let lastUpdate = parseInt(Keychain.get(this.MY_BMW_UPDATE_AT));

            if (lastUpdate > new Date().valueOf() - 1000 * 60 * 50) {
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

        if (!accessToken || accessToken == '') {
            console.log('No token found, get again');
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
        let req = new Request(BMW_SERVER_HOST + '//eadrax-coas/v1/oauth/token');
        req.headers = {
            'user-agent': 'Dart/2.10 (dart:io)',
            'x-user-agent': 'ios(15.0.2);bmw;1.5.0(8954)',
            authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhYzRkZTdmYi00ZTg3LTQ3MjctOTNkNS1jMDY1MzMwYmI3ZTgkMSRBJDE2Mjc0ODA0NTExNjciLCJuYmYiOjE2Mjc0ODA0NTEsImV4cCI6MTYyNzQ4Mzc1MSwiaWF0IjoxNjI3NDgwNDUxfQ.bX_KZbSzVYnM9ht8S9Cu__Kawg6XsEcpn-qA7YRi4GA',
            'content-type': 'application/json; charset=utf-8',
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
        console.log('Start to get token');
        const _password = await this.getEncryptedPassword();
        let req = new Request(BMW_SERVER_HOST + '/eadrax-coas/v1/login/pwd');

        req.method = 'POST';

        req.body = JSON.stringify({
            mobile: this.defaultData.username,
            password: _password
        });

        req.headers = {
            'user-agent': 'Dart/2.10 (dart:io)',
            'x-user-agent': 'ios(15.0.2);bmw;1.5.0(8954)',
            host: 'myprofile.bmw.com.cn'
        };

        const res = await req.loadJSON();
        if (res.code === 200) {
            return res.data;
        } else {
            console.log('Get token error');
            console.log(res);

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
            console.log('Encrypted password error');
            console.log(res);
            return await this.renderError('Encrypted PWD错误');
        }
    }

    async getVIN(access_token) {
        console.log('Start to get vehicle details');
        let req = new Request(
            `https://myprofile.bmw.com.cn/eadrax-vcs/v1/vehicles?apptimezone=480&appDateTime=${new Date().valueOf()}`
        );

        req.headers = {
            'user-agent': 'Dart/2.10 (dart:io)',
            'x-user-agent': 'ios(15.0.2);bmw;1.5.0(8954)',
            authorization: 'Bearer ' + access_token,
            'content-type': 'application/json; charset=utf-8',
            host: 'myprofile.bmw.com.cn',
            'x-cluster-use-mock': 'never',
            '24-hour-format': 'true'
        };

        const res = await req.loadJSON();
        let vin = this.defaultData.vin;

        if (res instanceof Array) {
            console.log('Get vehicle details success');
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

        let hasCheckIn = false;

        if (Keychain.contains(this.MY_BMW_LAST_CHECK_IN)) {
            const lastCheckIn = Keychain.get(this.MY_BMW_LAST_CHECK_IN);
            console.log(lastCheckIn);
            if (lastCheckIn === today) {
                hasCheckIn = true;
                console.log('Checked');
            }
        }
        if (!hasCheckIn) {
            console.log('Start check in');
            let req = new Request(BMW_SERVER_HOST + '/cis/eadrax-community/private-api/v1/mine/check-in');
            req.headers = {
                'user-agent': 'Dart/2.10 (dart:io)',
                'x-user-agent': 'ios(15.0.2);bmw;1.5.0(8954)',
                authorization: 'Bearer ' + access_token,
                'content-type': 'application/json; charset=utf-8',
                host: 'myprofile.bmw.com.cn',
                'x-cluster-use-mock': 'never',
                '24-hour-format': 'true'
            };

            req.method = 'POST';
            req.body = JSON.stringify({signDate: null});

            const res = await req.loadJSON();
            Keychain.set(this.MY_BMW_LAST_CHECK_IN, today);

            console.log(res);

            const n = new Notification();

            n.title = '签到';
            n.body = `${res.message}: ${res.businessCode}`;
            n.schedule();
        }
    }

    async getBmwOfficialImage(url, useCache = true) {
        const cacheKey = this.md5(url);
        const cacheFile = FileManager.local().joinPath(FileManager.local().temporaryDirectory(), cacheKey);

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

            let req = new Request(url);

            req.method = 'GET';
            req.headers = {
                'user-agent': 'Dart/2.10 (dart:io)',
                'x-user-agent': 'ios(15.0.2);bmw;1.5.0(8954)',
                authorization: 'Bearer ' + access_token,
                host: 'myprofile.bmw.com.cn',
                'x-cluster-use-mock': 'never',
                '24-hour-format': 'true'
            };

            const img = await req.loadImage();

            // 存储到缓存
            FileManager.local().writeImage(cacheFile, img);

            return img;
        } catch (e) {
            let ctx = new DrawContext();
            ctx.size = new Size(100, 100);
            ctx.setFillColor(Color.red());
            ctx.fillRect(new Rect(0, 0, 100, 100));
            return await ctx.getImage();
        }
    }

    async getVehicleImage(data) {
        let imageCar = '';
        let carImageUrl = `https://myprofile.bmw.com.cn/eadrax-ics/v3/presentation/vehicles/${data.vin}/images?carView=VehicleStatus`;
        if (this.defaultData.custom_car_image) {
            imageCar = await this.getImageByUrl(this.defaultData.custom_car_image);
        } else {
            imageCar = await this.getBmwOfficialImage(carImageUrl);
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
    getFont(fontName, fontSize) {
        return new Font(fontName, fontSize);
    }
}
// @组件代码结束

const {Testing} = require('./「小件件」开发环境');
await Testing(Widget);
