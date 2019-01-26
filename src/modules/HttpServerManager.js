// HttpServerManager.js
// Create by manliu Jan/21/2019
// 对外提供服务模块

var express = require('express')
var app = null

var HttpServerManager = BaseClass.extend({
    // 初始化
    init: function() {
        app = express();
        app.all('*', function(req, res, next){
            res.header('')
        })
    },
    
    // 准备
    prepare: function() {
        
    }
})

var g_httpServerMgr = null;

exports.getInstance = function() {
    if (!g_httpServerMgr) {
        g_httpServerMgr = new HttpServerManager()
    }

    return g_httpServerMgr
}
