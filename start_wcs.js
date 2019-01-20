// start_wcs.js
// Create by manliu Jan/20/2019
// 启动服务器

require('./lib/GlobalInit')

// 设置服务器名
global.serverType = 'wcs'
global.serverName = 'wechat_server'

// 初始化服务器
try {
    logger.I('start init server ...')

    // // 模块管理器
    // var model = require('./src/ServerManager').GetModel
    // app.ServerManager = model
    // var ServerManager = model()

    // // 初始化服务器
    // ServerManager.start(function(errorMsg) {
    //     if (errorMsg) {
    //         console.log('server init fail, %s', errorMsg)
    //         return
    //     }
    // })
} catch (e) {
    console.error(e.name, e.message, e.stack)
    return
}

logger.I('server(%s) init done.', serverName)
