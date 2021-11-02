const FILE_MGR = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();
await Promise.all(
    ['bmw-linker.js'].map(async (js) => {
        const REQ = new Request(`https://bmw-linker.yocky.info/${encodeURIComponent(js)}`);
        const RES = await REQ.load();
        FILE_MGR.write(FILE_MGR.joinPath(FILE_MGR.documentsDirectory(), js), RES);
    })
);
FILE_MGR.remove(module.filename);
// Safari.open('scriptable:///open?scriptName=' + encodeURIComponent('bmw-linker.js'));
