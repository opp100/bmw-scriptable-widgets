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
let WIDGET_FILE_NAME = 'bmw-linker.js';
let WIDGET_VERSION = 'v2.0.5';
let WIDGET_BUILD = '21110402';
let WIDGET_PREFIX = '[bmw-linker] ';

let DEPENDENCIES = [
    'jsencrypt.js' //本地化加密
];

let WIDGET_FONT = 'SF UI Display';
let WIDGET_FONT_BOLD = 'SF UI Display Bold';
let BMW_SERVER_HOST = 'https://myprofile.bmw.com.cn';
let APP_HOST_SERVER = 'https://cdn.jsdelivr.net/gh/opp100/bmw-scriptable-widgets@main/Publish/';
let JS_CDN_SERVER = 'https://cdn.jsdelivr.net/gh/opp100/bmw-scriptable-widgets@main/lib';

let DEFAULT_BG_COLOR_LIGHT = '#FFFFFF';
let DEFAULT_BG_COLOR_DARK = '#2B2B2B';
let DEFAULT_LOGO_LIGHT = 'https://z3.ax1x.com/2021/11/01/ICa7g1.png';
let DEFAULT_LOGO_DARK = 'https://z3.ax1x.com/2021/11/01/ICaqu6.png';

// header is might be used for preventing the bmw block the external api?
let BMW_HEADERS = {
    'user-agent': 'Dart/2.10 (dart:io)',
    'x-user-agent': 'ios(15.0.2);bmw;1.6.6(10038)',
    host: 'myprofile.bmw.com.cn'
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
        map_api_key: null
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
        this.name = 'My BMW';
        this.desc = '宝马互联App小组件';

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
            this.registerAction('检查更新', this.checkUpdatePress);
            this.registerAction('配置小组件', this.setWidgetConfig);
        }
    }

    async setWidgetConfig() {
        const confirmationAlert = new Alert();

        confirmationAlert.title = '郑重声明';
        confirmationAlert.message = `小组件需要使用到您的BMW账号\n\r\n首次登录请配置账号、密码进行令牌获取\n\r\n小组件不会收集您的个人账户信息，所有账号信息将存在iCloud或者iPhone上但也请您妥善保管自己的账号\n\r\n小组件是开源免费的，由BMW车主开发，所有责任与BMW公司无关\n\r\n作者: Yocky, UI: Popo`;

        confirmationAlert.addAction('同意');
        confirmationAlert.addCancelAction('不同意');

        await this.getDependencies();

        const userSelection = await confirmationAlert.presentAlert();
        if (userSelection == -1) {
            console.log('User denied');
            Keychain.set(APP_USE_AGREEMENT, 'false');
            return;
        } else {
            Keychain.set(APP_USE_AGREEMENT, 'true');
        }

        await this.userLoginCredentials();
        await this.colorSetPickUp();
    }

    async userLoginCredentials() {
        const userLoginAlert = new Alert();
        userLoginAlert.title = '配置BMW登录';
        userLoginAlert.message = '配置My BMW账号密码';

        userLoginAlert.addTextField('账号(您的电话)', this.userConfigData['username']);
        userLoginAlert.addSecureTextField('密码(不要有特殊字符)', this.userConfigData['password']);

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
        this.saveSettings();

        await this.userConfigInput();
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
                if (updateAT && updateAT > new Date().valueOf() - 1000 * 60 * 60) {
                    return console.warn('update checked within 1 hour');
                }
            }

            const req = new Request(APP_HOST_SERVER + '/version.json');
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
            console.error(e.message);
            return false;
        }

        return false;
    }

    async downloadUpdate() {
        try {
            const fileManager = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();

            const req = new Request(APP_HOST_SERVER + '/bmw-linker.js');
            const res = await req.load();
            fileManager.write(fileManager.joinPath(fileManager.documentsDirectory(), WIDGET_FILE_NAME), res);

            this.notify('更新成功', 'BMW Linker 小组件已经更新');
        } catch (e) {
            console.error(e.message);
            this.notify('更新失败', '请稍后尝试');
        }
    }

    async getDependencies() {
        const fileManager = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();
        let folder = fileManager.documentsDirectory();

        return await Promise.all(
            DEPENDENCIES.map(async (js) => {
                try {
                    // TODO: for download the file to lib folder
                    let filePath = fileManager.joinPath(folder, WIDGET_PREFIX + js);
                    console.warn(filePath);

                    let fileExists = fileManager.fileExists(filePath);

                    if (fileExists) {
                        return console.warn('Dependency found: ' + js); // TODO: verify file?;
                    }

                    const req = new Request(`${JS_CDN_SERVER}/${encodeURIComponent(js)}`);
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

                    return console.warn('Dependency found: ' + fileExists); // TODO: verify file?;
                } catch (e) {}
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
            let req = new Request(APP_HOST_SERVER + '/change_logs.text');

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
            map_api_key: '高德地图API_KEY（非必要）'
        };

        for (const key in configSet) {
            if (!configSet[key] || !this.userConfigData.hasOwnProperty(key)) {
                continue;
            }

            if (key == 'password') {
                userCustomConfigAlert.addSecureTextField(configSet[key], this.userConfigData[key]);
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
        }

        // write to local
        this.settings['UserConfig'] = this.userConfigData;
        this.saveSettings();
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
        if (this.userConfigData.username == '') {
            console.error('尚未配置用户');
            return await this.renderError('请先配置用户');
        }
        let screenSize = Device.screenSize();
        try {
            this.checkUpdate(true);
        } catch (e) {}

        const data = await this.getData();

        if (data == null) {
            return await this.renderError('获取车辆信息失败，请检查授权');
        }

        // start to render if we get information
        try {
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
            // if user override
            if (
                this.appColorData.light.startColor != DEFAULT_BG_COLOR_LIGHT ||
                this.appColorData.light.endColor != DEFAULT_BG_COLOR_LIGHT
            ) {
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
        let vehicleNameSize = 20;

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
        topRightBox.size = new Size(0, Math.round(width * 0.17));
        topRightBox.setPadding(paddingLeft - 1, 0, 0, paddingLeft - 1);

        try {
            let logoImage = topRightBox.addImage(await this.getAppLogo());
            logoImage.rightAlignImage();
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
        carStatusBox.backgroundColor = Color.dynamic(new Color('#f5f5f8', 0.5), new Color('#fff', 0.2));

        try {
            const carStatusTxt = carStatusBox.addText(`${data.status.doorsGeneralState}`);

            let displayFont = WIDGET_FONT;
            let displayFontColor = fontColor;
            if (data.status.doorsGeneralState != '已上锁') {
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
        const bottomBox = w.addStack();

        bottomBox.setPadding(2, 12, 8, 10); // 图片的边距
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

    async renderMedium(data, renderLarge = false) {
        let w = new ListWidget();
        let fontColor = this.getFontColor();
        w.backgroundGradient = this.getBackgroundColor();

        w.setPadding(0, 0, 0, 0);
        const {width, height} = data.size['medium'];

        let paddingTop = Math.round(height * 0.09);
        let paddingLeft = Math.round(width * 0.055);

        const topContainer = w.addStack();
        topContainer.layoutHorizontally();

        const vehicleNameContainer = topContainer.addStack();
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

        const logoImageContainer = topContainer.addStack();
        logoImageContainer.layoutHorizontally();
        logoImageContainer.setPadding(paddingTop, 0, 0, paddingTop);
        logoImageContainer.addSpacer();

        try {
            let logoImage = logoImageContainer.addImage(await this.getAppLogo());
            logoImage.rightAlignImage();
        } catch (e) {}

        const bodyContainer = w.addStack();
        bodyContainer.layoutHorizontally();

        const leftContainer = bodyContainer.addStack();

        leftContainer.layoutVertically();
        leftContainer.size = new Size(width * 0.55, Math.ceil(height * 0.75));

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
        carStatusBox.backgroundColor = Color.dynamic(new Color('#f5f5f8', 0.7), new Color('#fff', 0.2));

        try {
            const carStatusTxt = carStatusBox.addText(`${data.status.doorsGeneralState}`);

            let displayFont = WIDGET_FONT;
            let displayFontColor = fontColor;
            if (data.status.doorsGeneralState != '已上锁') {
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
        locationContainer.setPadding(0, paddingLeft, 16, Math.ceil(width * 0.1));

        const locationText = locationContainer.addText(locationStr);
        locationText.font = this.getFont(`${WIDGET_FONT}`, 10);
        locationText.textColor = fontColor;
        locationText.textOpacity = 0.5;
        locationText.url = this.buildMapURL(data);

        const rightContainer = bodyContainer.addStack();
        rightContainer.setPadding(8, 0, 0, 12);
        rightContainer.layoutVertically();
        rightContainer.size = new Size(Math.ceil(width * 0.45), Math.ceil(height * 0.75));

        rightContainer.addSpacer();

        const carImageContainer = rightContainer.addStack();
        carImageContainer.setPadding(0, 0, 10, paddingTop);
        carImageContainer.size = new Size(Math.ceil(width * 0.45), Math.ceil(height * 0.45));

        carImageContainer.bottomAlignContent();

        try {
            let imageCar = await this.getVehicleImage(data);
            let carImage = carImageContainer.addImage(imageCar);
            carImage.rightAlignImage();
        } catch (e) {}

        if (data.status && data.status.doorsAndWindows && data.status.doorsAndWindows.length > 0) {
            let doorWindowStatus = data.status.doorsAndWindows[0];

            let windowStatusContainer = rightContainer.addStack();
            windowStatusContainer.setPadding(0, 0, 16, 0);

            windowStatusContainer.layoutHorizontally();
            windowStatusContainer.addSpacer();

            let windowStatus = `${doorWindowStatus.title} ${doorWindowStatus.state} `;
            let windowStatusText = windowStatusContainer.addText(windowStatus);

            let displayFont = WIDGET_FONT;
            let displayFontColor = fontColor;
            if (doorWindowStatus.state != '已关闭') {
                displayFontColor = new Color(WIDGET_DANGER_COLOR, 1);
                displayFont = WIDGET_FONT_BOLD;
            }

            windowStatusText.font = this.getFont(displayFont, 10);
            windowStatusText.textColor = displayFontColor;
            windowStatusText.textOpacity = 0.5;

            windowStatusContainer.addSpacer();
        }

        w.url = 'de.bmw.connected.mobile20.cn://';

        return w;
    }

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
            let ctx = new DrawContext();
            ctx.size = new Size(width, height);

            ctx.setFillColor(new Color('#eee'));
            ctx.fillRect(new Rect(0, 0, width, height));
            ctx.drawTextInRect(e.message || '获取地图失败', new Rect(20, 20, width, height));

            return await ctx.getImage();
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
            for (const fuelIndicator of fuelIndicators) {
                for (const key in _fuelObj) {
                    if (fuelIndicator[key] && !_fuelObj[key]) {
                        _fuelObj[key] = fuelIndicator[key];
                    }
                }
            }

            for (const key in _fuelObj) {
                if (!_fuelObj[key]) {
                    _fuelObj[key] = '';
                }
            }
        } catch (e) {}

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

    async getData() {
        let accessToken = await this.getAccessToken();

        if (!accessToken || accessToken == '') {
            return null;
        }

        try {
            await this.checkInDaily(accessToken);
        } catch (e) {
            console.error(e.message);
        }

        return await this.getVehicleDetails(accessToken);
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

    async getAccessToken() {
        let accessToken = '';
        if (Keychain.contains(MY_BMW_TOKEN_UPDATE_LAST_AT)) {
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
                Keychain.set(MY_BMW_TOKEN, accessToken);
                Keychain.set(MY_BMW_REFRESH_TOKEN, refresh_token);
            } catch (e) {
                console.error(e.message);
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
            let JSEncrypt = importModule(`${WIDGET_PREFIX}jsencrypt`);

            let encrypt = new JSEncrypt();
            encrypt.setPublicKey(publicKey);

            return encrypt.encrypt(this.userConfigData.password);
        } catch (e) {
            console.error(' error ' + e.message);
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

        if (res.access_token !== undefined) {
            const {access_token, refresh_token} = res;

            Keychain.set(MY_BMW_TOKEN, access_token);
            Keychain.set(MY_BMW_REFRESH_TOKEN, refresh_token);

            Keychain.set(MY_BMW_TOKEN_UPDATE_LAST_AT, String(new Date().valueOf()));

            return access_token;
        } else {
            return '';
        }
    }

    async getVehicleDetails(access_token) {
        let vin = this.userConfigData.vin || '';

        let lastUpdateKey = vin + MY_BMW_VEHICLE_UPDATE_LAST_AT;
        let localVehicleDataKey = vin + MY_BMW_VEHICLE_DATA;

        // skip update prevent access to bmw too much
        try {
            if (Keychain.contains(lastUpdateKey) && Keychain.contains(localVehicleDataKey)) {
                let lastUpdate = parseInt(Keychain.get(lastUpdateKey));

                let cachedVehicleData = JSON.parse(Keychain.get(localVehicleDataKey));

                // load data every 5 mins
                if (lastUpdate > new Date().valueOf() - 1000 * 60 * 1 && cachedVehicleData && cachedVehicleData.vin) {
                    console.log('Get vehicle data from cache');

                    return cachedVehicleData;
                }
            }
        } catch (e) {
            console.warn('Load vehicle from cache failed');
        }

        console.log('Start to get vehicle details online');
        let req = new Request(BMW_SERVER_HOST + `/eadrax-vcs/v1/vehicles?appDateTime=${new Date().valueOf()}`);

        req.headers = {
            ...BMW_HEADERS,
            authorization: 'Bearer ' + access_token,
            'content-type': 'application/json; charset=utf-8'
        };

        const vehicles = await req.loadJSON();

        if (vehicles && Array.isArray(vehicles) && vehicles.length > 0) {
            let vehicleData = null;

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

            Keychain.set(lastUpdateKey, String(new Date().valueOf()));
            Keychain.set(localVehicleDataKey, JSON.stringify(vehicleData));

            return vehicleData;
        }

        console.error('Load vehicle failed');
        return null;
    }

    async checkInDaily(access_token) {
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
            authorization: 'Bearer ' + access_token,
            'content-type': 'application/json; charset=utf-8'
        };

        req.method = 'POST';
        req.body = JSON.stringify({signDate: null});

        const res = await req.loadJSON();

        if (Number(res.code) >= 200 && Number(res.code) <= 300) {
            Keychain.set(MY_BMW_LAST_CHECK_IN_AT, today);
        }

        console.log(res);

        let msg = `${res.message || ''}`;

        if (res.code != 200) {
            msg += `: ${res.businessCode || ''}, 上次签到: ${lastCheckIn || 'None'}.`;
        }

        this.notify('My BMW签到', msg);
    }

    async getBmwOfficialImage(url, useCache = true) {
        const cacheKey = this.md5(url);
        const cacheFile = FileManager.local().joinPath(FileManager.local().temporaryDirectory(), cacheKey);

        if (useCache && FileManager.local().fileExists(cacheFile)) {
            return Image.fromFile(cacheFile);
        }

        try {
            let access_token = '';
            if (Keychain.contains(MY_BMW_TOKEN)) {
                access_token = Keychain.get(MY_BMW_TOKEN);
            } else {
                throw new Error('没有token');
            }

            let req = new Request(url);

            req.method = 'GET';
            req.headers = {
                ...BMW_HEADERS,
                authorization: 'Bearer ' + access_token
            };

            const img = await req.loadImage();

            // 存储到缓存
            FileManager.local().writeImage(cacheFile, img);

            return img;
        } catch (e) {
            let ctx = new DrawContext();
            ctx.size = new Size(100, 100);
            ctx.setFillColor(new Color('#eee', 1));
            ctx.drawTextInRect(e.message || '获取车辆图片失败', new Rect(20, 20, 100, 100));
            ctx.fillRect(new Rect(0, 0, 100, 100));
            return await ctx.getImage();
        }
    }

    async getVehicleImage(data) {
        let imageCar = '';
        let carImageUrl =
            BMW_SERVER_HOST + `/eadrax-ics/v3/presentation/vehicles/${data.vin}/images?carView=VehicleStatus`;
        if (this.userConfigData.custom_vehicle_image) {
            imageCar = await this.getImageByUrl(this.userConfigData.custom_vehicle_image);
        } else {
            imageCar = await this.getBmwOfficialImage(carImageUrl);
        }

        return imageCar;
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
// @组件代码结束

const {Testing} = require('./「小件件」开发环境');
await Testing(Widget);
