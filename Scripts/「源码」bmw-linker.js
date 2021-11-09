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
let APP_HOST_SERVER = 'https://bmw-linker.yocky.cn';
let JS_CDN_SERVER = 'https://cdn.jsdelivr.net/gh/opp100/bmw-scriptable-widgets/lib';

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
        const fileManager = FileManager['local']();
        let folder = fileManager.documentsDirectory();

        let libFolder = fileManager.joinPath(folder, 'lib');
        try {
            if (!fileManager.isDirectory(libFolder)) {
                fileManager.createDirectory(libFolder);
            }
        } catch (e) {
            console.error(e.message);
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

                    return console.warn('Dependency found: ' + filePath);
                } catch (e) {
                    console.error(e.message);
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

        let data = await this.getData();

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

        let renderMediumContent = !renderLarge || this.userConfigData.map_api_key;

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
        leftContainer.size = new Size(width * 0.85, Math.ceil(height * 0.75));
        if (renderMediumContent) {
            leftContainer.size = new Size(width * 0.55, Math.ceil(height * 0.75));
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
        carStatusBox.backgroundColor = Color.dynamic(new Color('#f5f5f8', 0.7), new Color('#fff', 0.2));

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
            locationContainer.setPadding(0, paddingLeft, 16, Math.ceil(width * 0.1));
        }
        const locationText = locationContainer.addText(locationStr);
        locationText.font = this.getFont(`${WIDGET_FONT}`, 10);
        locationText.textColor = fontColor;
        locationText.textOpacity = 0.5;
        locationText.url = this.buildMapURL(data);

        if (renderMediumContent) {
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
        carImageContainer.layoutHorizontally();

        carImageContainer.setPadding(0, paddingLeft, 0, 0);

        carImageContainer.bottomAlignContent();

        try {
            let canvas = new DrawContext();
            let canvasWidth = Math.round(width);
            let canvasHeight = Math.round(height * 0.5);
            console.warn('canvasWidth ' + canvasWidth);
            console.warn('canvasHeight ' + canvasHeight);

            canvas.size = new Size(canvasWidth, canvasHeight);
            canvas.opaque = false;
            canvas.setFont(this.getFont(WIDGET_FONT_BOLD, Math.round(canvasHeight / 3.5)));
            canvas.setTextColor(this.getFontColor());
            canvas.respectScreenScale = true;

            try {
                let checkControlMessages = data.status.checkControlMessages.filter((checkControlMessage) => {
                    return checkControlMessage['criticalness'] != 'nonCritical';
                });

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
                            Math.round(canvasHeight / 3.5 - 5),
                            Math.round(canvasWidth * 0.5),
                            Math.round(canvasWidth * 0.5)
                        )
                    );
                } else {
                    let messageFontSize = Math.round(canvasHeight / 12);
                    let messageOffset = 0;

                    canvas.setFont(this.getFont(WIDGET_FONT_BOLD, messageFontSize));
                    canvas.setTextColor(new Color('#f00', 1));

                    for (const checkControlMessage of checkControlMessages) {
                        canvas.drawTextInRect(
                            checkControlMessage.title,
                            new Rect(0, messageOffset, Math.round(canvasWidth * 0.5), Math.round(canvasWidth * 0.5))
                        );

                        messageOffset = messageOffset + messageFontSize;
                    }
                }
            } catch (e) {
                console.warn(e.message);
            }

            let carImage = await this.getVehicleImage(data);
            let imageSize = this.getImageSize(carImage.size.width, carImage.size.height, canvasWidth, canvasHeight);

            console.warn('rate ' + imageSize.width / imageSize.height);
            console.warn('imageSize ' + JSON.stringify(imageSize));

            canvas.drawImageInRect(
                carImage,
                new Rect(
                    Math.round(canvasWidth * 0.15), //
                    Math.round(canvasHeight * 0.3),
                    imageSize.width,
                    imageSize.height
                )
            );

            let image = canvas.getImage();
            let carStatusImage = carImageContainer.addImage(image);

            carStatusImage.centerAlignImage();
            carStatusImage.url = 'de.bmw.connected.mobile20.cn://';
        } catch (e) {
            console.log(e.message);
        }

        if (data.status && data.status.doorsAndWindows && data.status.doorsAndWindows.length > 0) {
            largeExtraContainer.addSpacer();

            let doorWindowStatus = data.status.doorsAndWindows[0];

            let windowStatusContainer = largeExtraContainer.addStack();
            windowStatusContainer.setPadding(0, 0, 16, 0);

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

    getImageSize(imageWidth, imageHeight, canvasWidth, canvasHeight) {
        let a = imageWidth;
        let b = imageHeight;

        let c = Math.sqrt(Math.pow(imageWidth, 2) + Math.pow(imageHeight, 2));
        let canvasC = Math.sqrt(Math.pow(canvasWidth, 2) + Math.pow(canvasHeight, 2));

        if (c > canvasC) {
            c = c * 0.8;

            if (a > b) {
                let k = a / b;
                b = Math.sqrt(Math.pow(c, 2) / (Math.pow(k, 2) + 1));
                a = b * k;
            } else {
                let k = b / a;
                a = Math.sqrt(Math.pow(c, 2) / (Math.pow(k, 2) + 1));
                b = a * k;
            }

            return this.getImageSize(a, b, canvasWidth, canvasHeight);
        }

        return {width: a, height: b};
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
            let JSEncrypt = importModule(`lib/jsencrypt`);

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
                if (lastUpdate > new Date().valueOf() - 1000 * 60 * 5 && cachedVehicleData && cachedVehicleData.vin) {
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

    async getBmwOfficialImage(data, useCache = true) {
        let url = `${BMW_SERVER_HOST}/eadrax-ics/v3/presentation/vehicles/${data.vin}/images?carView=VehicleStatus`;

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
            '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LTQxOWEtODEzOC1jNDM2OGNkMDFiMGUiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZDJmYWM4OGQtMDM4YS00NTRiLWEyMDQtYTFjOGIxZDE3YTkxIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YjE5MGM0MjYtNmQ3OC00NmVhLWIxYjItZGMyOTU2YTI5NDgwIgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iTWFjIE9TIgogICBHSU1QOlRpbWVTdGFtcD0iMTYzNjQ0NzM4MTEyMzU0NSIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjI0IgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEzMDc4OTc5LWVmMGQtNGMxZS04NTQyLWU1NjRlMGRmNDI4YSIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChNYWMgT1MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIxLTExLTA5VDE2OjQzOjAxKzA4OjAwIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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';

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
// @组件代码结束

const {Testing} = require('./「小件件」开发环境');
await Testing(Widget);
