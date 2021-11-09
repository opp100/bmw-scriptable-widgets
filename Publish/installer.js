const FILE_MGR = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();
let files = FILE_MGR.listContents(FILE_MGR.documentsDirectory());

await Promise.all(
    ['bmw-linker.js'].map(async (js) => {
        const REQ = new Request(`https://bmw-linker.yocky.cn/${encodeURIComponent(js)}`);
        const RES = await REQ.load();
        try {
            FILE_MGR.remove(FILE_MGR.joinPath(FILE_MGR.documentsDirectory(), js));
        } catch (e) {}

        FILE_MGR.write(FILE_MGR.joinPath(FILE_MGR.documentsDirectory(), js), RES);
    })
);

FILE_MGR.remove(module.filename);
Safari.open('scriptable:///run?scriptName=' + encodeURIComponent('bmw-linker.js'));
