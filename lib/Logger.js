// Logger.js
// Create by manliu Nov/23/2018
// 日志模块

var log4js = require('log4js')
var path = require('path')
var fs = require('fs')
var util = require('util')

var Logger = baseClass.extend('Logger', {
    logger: null,
    loggerError: null,

    // 初始化函数
    init: function() {},

    // 设置日志路径
    setLoggerPath: function(basicPath) {
        var logPath = path.join(basicPath, 'log')

        // 创建log目录
        if (!fs.existsSync(logPath)) {
            fs.mkdirSync(logPath)
        }

        // 每天创建一个日志文件
        log4js.configure({
            appenders: {
                console: { type: 'console' },

                log: {
                    type: 'dateFile',
                    pattern: '_yyyy-MM-dd.log',
                    alwaysIncludePattern: true,
                    filename: path.join(logPath, 'log')
                },
                error: {
                    type: 'dateFile',
                    pattern: '_yyyy-MM-dd.log',
                    alwaysIncludePattern: true,
                    filename: path.join(logPath, 'error'),
                    category: 'error'
                }
            },
            categories: {
                default: {
                    appenders: ['console', 'log', 'error'],
                    level: 'all'
                },
                log: {
                    appenders: ['console', 'log'],
                    level: 'all'
                },
                error: { appenders: ['error', 'console'], level: 'all' }
            }
        })

        this.logger = log4js.getLogger('log')
        this.loggerError = log4js.getLogger('error')
    },

    // 全局log
    I: function() {
        if (isDevelop) {
            var logText = util.format.apply(null, arguments)
            this.logger.debug(['[Global] ', logText].join(''))
        }
    },

    // 全局警告 log
    W: function() {
        var logText = util.format.apply(null, arguments)
        this.logger.warn(['[Global] ', '###', logText].join(''))
    },

    // 全局错误 log
    E: function() {
        var logText = util.format.apply(null, arguments)
        this.loggerError.error(['[Global] ', '###', logText].join(''))
    },

    // 全局系统 log
    S: function() {
        var logText = util.format.apply(null, arguments)
        this.logger.debug(['[Global] ', logText].join(''))
    }
})

exports.logger = new Logger()
