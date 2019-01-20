// app.js
// Create by manliu Nov/24/2018
// app 入口函数

// app初始化
var express = require('express')

var app = express()

// 设置服务器标示
app.serverType = 'wcs'
app.serverName = 'wechat_server'

// 放到全局变量中
global.app = app

// 初始化日志模块

// 初始化服务器
app.start_server = function(succ_cb) {
    try {
        console.log('start init server ...')

        // 模块管理器
        var model = require('./src/ServerManager').GetModel
        app.ServerManager = model
        var ServerManager = model()

        // 初始化服务器
        ServerManager.start(function(errorMsg) {
            if (errorMsg) {
                console.log('server init fail, %s', errorMsg)
                return
            }
        })
    } catch (e) {
        console.error(e.name, e.message, e.stack)
        return
    }

    console.log('server(%s) init done.', app.serverName)

    // 初始化成功，执行回调
    if (typeof succ_cb === 'function') {
        succ_cb()
    }
}

// 监听异常
process.on('uncaughtException', function(error) {
    app.errLog(
 		'global error (%s):(%s)\n(%s)',
       error.name,
       error.message,
       error.stack
    )
})

module.exports = app
