// HttpServerManager.js
// Create by manliu Jan/21/2019
// 对外提供服务模块

var express = require('express')
var bodyParser = require('body-parser')
var ClientPack = require('./httpServerPack/ClientPack')
var app = null
var enable = false

var HttpServerManager = SingleClass.extend('HttpServerManager', {
    // 初始化
    init: function() {
        app = express()
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded())
        app.all('*', function(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*')
            res.header(
                'Access-Control-Allow-Headers',
                'Content-Type, Content-Length, Authorization, Accept, X-Requested-With'
            )
            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')

            if (req.method == 'OPTIONS') {
                res.send(200)
            } else {
                next()
            }
        })

        app.post('/ClientPack', ClientPack.Pack)
    },

    // 准备
    prepare: function() {
        app.listen(cfg.httpPort, function() {
            logger.I('http server start listen on : %d.', cfg.httpPort)
        })

        // 设置服务器可用
        enable = true
    },

    // 是否可用
    isEnable: function() {
        return enable
    },

    // 关机
    shutdown: function() {}
})

exports.getInstance = HttpServerManager.getInstance
