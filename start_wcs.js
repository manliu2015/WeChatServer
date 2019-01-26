// start_wcs.js
// Create by manliu Jan/20/2019
// 启动服务器

// 设置服务器跟路径
global.getBasePath() {
	return __dirname
}

require('./lib/GlobalInit')

// 设置服务器名
global.serverType = 'wcs'
global.serverName = 'wechat_server'

// 初始化服务器
try {
    logger.I('start init server ...')

    // 模块管理器
    var moduleMgr = require('./src/ModuleManager').getInstance()
    global.moduleMgr = moduleMgr

    // 初始化所有模块
    moduleMgr.loadAll();
} catch (e) {
    logger.E(e.name, e.message, e.stack)
    return
}

logger.I('server(%s) init done.', serverName)
