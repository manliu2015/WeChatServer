// ModuleMnager.js
// Create by manliu
// 模块管理器

var path = require('path')
var jsModules = require('./config/jsModules')

var ModuleMnager = BaseClass.extend({
    init: function (){
        // do nothing
    },
    
    // 加载所有模块
    loadAll: function () {
        var moduleName
        for (moduleName in jsModules) {
            global[moduleName] = require(jsModules[moduleName]).getInstance()
        }
    },
    
    // 通知所有模块准备数据
    prepare: function() {
        var moduleName
        for (moduleName in jsModules) {
            if (global[moduleName])
                global[moduleName].prepare()
        }
    }
})

var g_moduleMgr = null

exports.getInstance = function() {
    if (!g_moduleMgr) {
        g_moduleMgr = new ModuleMnager()
    }

    return g_moduleMgr
}
