// start_wcs.js
// Create by manliu Jan/20/2019
// 启动服务器

var repl = require('repl')

// 设置服务器跟路径
global.getBasePath = function() {
    return __dirname
}

// 服务器是否初始化完成
global.isInitDone = function() {
    return initDone
}

// 全局服务器配置
global.cfg = require('./config/serverConfig')

// 初始化
require('./lib/GlobalInit')

// 全局宏定义
global.Const = require('./src/global/Const')

// 全局工具类
global.ComTool = require('./src/tools/ComTool').getInstance()
global.GlobalSend = require('./src/global/GlobalSend').getInstance()

// 设置服务器名
global.serverType = 'wcs'
global.serverName = 'wechat_server'
process.title = serverName

var initDone = false

// 初始化服务器
try {
    logger.I('start init server ...')

    // 模块管理器
    var moduleMgr = require('./src/ModuleManager').getInstance()
    global.moduleMgr = moduleMgr

    // 初始化所有模块
    logger.I('load all modules ...')
    moduleMgr.loadAll()
    logger.I('load all modules ok.')

    logger.I('prepare all modules ...')
    moduleMgr.prepare()
    logger.I('prepare all modules ok.')
} catch (e) {
    logger.E(e.name, e.message, e.stack)
    return
}

initDone = true
logger.I('server(%s) init done.', serverName)

repl.start({
    prompt: '>',
    input: process.stdin,
    output: process.stdout
})
