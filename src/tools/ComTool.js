// ComTool.js
// Create by manliu Jan/27.2019
// 公共工具

var fs = require('fs')

var ComTool = SingleClass.extend('ComTool', {
    init: function() {},

    // 获取目录下的所有文件
    getPathInfoList: function(curPath) {
        var pathDirList, pathDirCount, index, fileNameList, childDirList, pathDir

        if (!fs.existsSync(curPath)) {
            this.E('getPathInfoList(%s) not find', curPath)
            return [curPath, [], []]
        }

        fileNameList = []
        childDirList = []
        pathDirList = fs.readdirSync(curPath)
        pathDirCount = pathDirList.length

        for (index = 0; index < pathDirCount; index++) {
            pathDir = pathDirList[index]

            // 如果不是文件
            if (pathDir.indexOf('.') === -1) {
                childDirList.push(pathDir)
            } else {
                fileNameList.push(pathDir)
            }
        }

        return [curPath, childDirList, fileNameList]
    }
})

exports.getInstance = ComTool.getInstance
