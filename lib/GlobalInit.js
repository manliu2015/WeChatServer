// globalInit.js
// Create by manliu Nov/23/2018
// 初始化全局模块

require('./GlobalUtils')
var fs = require('fs')

// 初始化开发环境
global.isDevelop = false
if (fs.existsSync('sdfsfsd2342390898y')) {
    global.isDevelop = true
}

// 初始化基类
var baseClass = require('./BaseClass').BaseClass
global.baseClass = baseClass

// 初始化日志模块
var logger = require('./Logger').logger
logger.setLoggerPath(getBasePath())
global.logger = logger

// 监听异常
process.on('uncaughtException', function(error) {
    logger.E(
        'global error (%s):(%s)\n(%s)',
        error.name,
        error.message,
        error.stack
    )
})
