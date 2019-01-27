// ModuleMnager.js
// Create by manliu
// 模块管理器

var path = require('path')
var jsModules = require('../config/jsModules')

var ModuleMnager = SingleClass.extend('ModuleManager', {
    init: function() {
        // do nothing
    },

    // 加载所有模块
    loadAll: function() {
        for (var moduleName in jsModules) {
            var modulePath = path.join(getBasePath(), jsModules[moduleName])
            logger.I('load %s ...', modulePath)
            global[moduleName] = require(modulePath).getInstance()
            logger.I('load %s ok.', modulePath)
        }
    },

    // 通知所有模块准备数据
    prepare: function() {
        for (var moduleName in jsModules) {
            logger.I('prepare %s ...', moduleName)
            if (global[moduleName]) global[moduleName].prepare()
            logger.I('prepare %s ok.', moduleName)
        }
    }
})

exports.getInstance = ModuleMnager.getInstance
