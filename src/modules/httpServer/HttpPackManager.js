// HttpPackManager.js
// Create by manliu Jan/27/2019
// 服务器间 http 通信封包管理器

var path = require('path')
var fs = require('fs')
var requestPromise = require('request-promise')

var HttpPackManager = SingleClass.extend('HttpPackManager', {
    init: function() {
        //--------客户端封包--------

        // 发送给客户端的封包
        this.sendToClientPackDict = {}

        // 接受客户端的封包
        this.receiveClientPackDict = {}

        // 接收封包对应的逻辑模块字典
        this.receiveClientPackModuleDict = {}

        // 文件名对应文件路径
        this.receiveClientPackModulePathDict = {}
    },

    prepare: function() {
        // 初始化
        this.initPackInfo()
        this.initPack()
    },

    // 初始化本服务器封包通信字典
    initPackInfo: function() {
        var clientHttpPackDict = GlobalSend.ClientHttpPackDict

        for (var packHeadName in clientHttpPackDict) {
            var headNameList = packHeadName.split('.')
            if (headNameList.length != 3) {
                this.E('ClientHttpPackDict packHeadName:%s error', packHeadName)
                continue
            }
            //不是本服务器接收的封包,过滤掉
            if (headNameList[2] != serverType) {
                continue
            }

            var headInt = Math.floor(headNameList[1])
            if (this.receiveClientPackDict.hasOwnProperty(headInt)) {
                this.E('receiveClientPackDict have find(%s) headInt', packHeadName)
                continue
            }

            this.receiveClientPackDict[headInt] = clientHttpPackDict[packHeadName]
        }
    },

    // 初始化封包模块实例化
    initPack: function() {
        // 接收客户端触发的模块
        var clientCommandPath = path.join(__dirname, './httpCmds/Client')
        if (fs.existsSync(clientCommandPath)) {
            this.readPathPackModule(
                clientCommandPath,
                this.receiveClientPackDict,
                this.receiveClientPackModuleDict,
                this.receiveClientPackModulePathDict
            )
        } else {
            throw new Error('can not find client http cmds folder.')
        }

        this.I('init client logic complete:%j,%j', this.receiveClientPackDict, this.receiveClientPackModulePathDict)
    },

    // 读取路径下的封包模块初始化
    readPathPackModule: function(commandPath, receivePackDict, receivePackModuleDict, receivePackModulePathDict) {
        var pathInfoList = ComTool.getPathInfoList(commandPath)
        var curPath = pathInfoList[0]
        var childPathList = pathInfoList[1]
        var fileNameList = pathInfoList[2]
        var childPathCount = childPathList.length

        for (var index = 0; index < childPathCount; index++) {
            var childPathInfoList = ComTool.getPathInfoList(path.join(curPath, childPathList[index]))
            var childPath = childPathInfoList[0]
            var childFileNameList = childPathInfoList[2]
            var childFileCount = childFileNameList.length

            for (var index_j = 0; index_j < childFileCount; index_j++) {
                var fileName = childFileNameList[index_j]
                var fileNameList = fileName.split('.')
                fileName = fileNameList[0]
                var fileType = fileNameList[1]
                if (fileType != 'js') {
                    continue
                }

                var fileNameList = fileName.split('_')
                if (fileNameList.length != 2) {
                    this.E('initPack (%s) fileName(%s) not suit.', childPath, fileName)
                    continue
                }

                var headInt = parseInt(fileNameList[0], 16)
                var scriptPath = path.join(childPath, fileName)
                if (!receivePackDict.hasOwnProperty(headInt)) {
                    // 不在 globalSend 中配置
                    this.E('scriptPath(%s) headInt not find in receivePack.', scriptPath, c)
                    continue
                }

                if (receivePackModuleDict.hasOwnProperty(headInt)) {
                    this.E('scriptPath(%s) error headInt:%s already find.', scriptPath, headInt.toString(16))
                    continue
                }

                try {
                    var PackModule = require(scriptPath).getInstance()
                } catch (e) {
                    this.E('require(%s) %s,%s,%s', scriptPath, e.name, e.message, e.stack)
                    continue
                }

                receivePackModuleDict[headInt] = PackModule
                receivePackModulePathDict[fileName] = scriptPath
            }
        }
    },

    //------------------------回调函数---------------------------------------
    // 接受客户端封包
    onReceivePack: function(packType, response, loginIP, senderName, sign, receivePack) {
        var receivePackModuleDict = {}
        if (packType == 'Client') {
            receivePackModuleDict = this.receiveClientPackModuleDict
        } else {
            this.E('onReceivePack(%s):%j error', packType, receivePack)
            return response.send({ code: Const.HTTP_NOT_FIND_PACK })
        }

        var packHead = receivePack.head
        if (!receivePackModuleDict.hasOwnProperty(packHead)) {
            this.E('onReceivePack(%s):%j packHead not find PackModel', packType, receivePack)
            return response.send({ code: Const.HTTP_NOT_FIND_PACK })
        }

        var packModule = receivePackModuleDict[packHead]
        var result = packModule.onReceivePack({ senderIP: loginIP, senderName: senderName }, receivePack)

        if (!result) {
            // 没有返回值，默认回复一个空字典
            response.send({ code: Const.HTTP_PACK_NOT_ACTION })
            return
        }

        var resultType = Object.prototype.toString.call(result).slice('[object '.length, -1)

        // 异步等待情况下 requestPromise 对象 result instanceof Promise 会验证失败
        // 所以使用toString接口判断
        if (result.toString() == '[object Promise]') {
            var that = this

            return result
                .then(function(resultInfo) {
                    // 如果返回空,封包没有什么回复动作,或者条件没有通过不执行
                    if (!resultInfo) {
                        response.send({
                            code: Const.HTTP_PACK_NOT_ACTION
                        })

                        return
                    }

                    var resultInfoType = Object.prototype.toString.call(result).slice('[object '.length, -1)

                    // 如果返回字符串表示执行错误携带错误信息
                    if (resultInfoType == 'String') {
                        return response.send(resultInfo)
                    } else if (resultInfoType == 'Boolean') {
                        return response.send(resultInfo)
                    }
                    // 如果返回值是字典或者列表,则直接回复字典给客户端
                    else if (resultInfoType == 'Array' || resultInfoType == 'Object') {
                        return response.send(resultInfo)
                    } else {
                        that.E(
                            'onReceivePack(%s) resultInfo(%j) resultInfoType:%s error.',
                            receivePack,
                            resultInfo,
                            resultInfoType
                        )

                        return response.send({
                            code: Const.HTTP_PACK_NOT_ACTION
                        })
                    }
                })
                .catch(function(error) {
                    that.E('error:%s', error.stack)
                    return response.send({
                        code: Const.HTTP_PACK_RUN_ERROR
                    })
                })
        } else if (resultType == 'String') {
            // 如果返回字符串表示执行错误携带错误信息
            return response.send(result)
        } else if (resultType == 'Boolean') {
            return response.send(result)
        } else if (resultType == 'Array' || resultType == 'Object') {
            // 如果返回值是字典或者列表,则直接回复字典给客户端
            return response.send(result)
        } else {
            this.E('onReceivePack(%j) result(%j) resultType:%s error.', receivePack, result, resultType)
            return response.send({ code: Const.HTTP_PACK_NOT_ACTION })
        }
    },

    // 重载
    reloadPackModule: function(fileName) {
        var fileNameList = fileName.split('_')
        if (fileNameList.length != 2) {
            this.E('reloadPackModule fileName(%s) error.', fileName)
            return false
        }

        var headInt = parseInt(fileNameList[0], 16)
        var scriptPath = ''
        var receivePackModuleDict = {}

        if (this.receiveClientPackModulePathDict.hasOwnProperty(fileName)) {
            scriptPath = this.receiveClientPackModulePathDict[fileName]
            receivePackModuleDict = this.receiveClientPackModuleDict
        } else {
            this.E('reloadPackModule(%s) not find.', fileName)
            return false
        }

        var filePath = scriptPath + '.js'
        if (!fs.existsSync(filePath)) {
            this.E('reloadPackModule not find：%s.', filePath)
            return false
        }

        delete require.cache[[require.resolve(scriptPath)]]

        try {
            var packModule = require(scriptPath).getInstance()
        } catch (e) {
            this.E('reloadPackModule require(%s),%s,%s,%s', scriptPath, e.name, e.message, e.stack)
            return false
        }

        receivePackModuleDict[headInt] = packModule
        return true
    },

    //-----------------------获取函数----------------------------------------
    // 获取发送封包结构体
    getHttpSendClientPack: function(head) {
        if (!this.sendToClientPackDict.hasOwnProperty(head)) {
            this.E('GetHttpSendClientPack sendToClientPackDict not find(%s).', head)
            return null
        }

        return { Head: head }
    },

    // 获取url字符串格式
    getUrlStr: function(dataDict) {
        if (!dataDict) {
            return ''
        }

        var argList = Object.keys(dataDict)
        argList.sort()
        var count = argList.length
        var urlSendStr = '?'

        for (var index = 0; index < count; index++) {
            var key = argList[index]
            urlSendStr += key + '=' + dataDict[key] + '&'
        }

        // 去掉最后一个&
        urlSendStr = urlSendStr.substring(0, urlSendStr.length - 1)
        return urlSendStr
    },

    // 发送http封包
    sendHttpPack: function(url, sendPack) {
        return this.createPromiseHttpSend('POST', url, { ServerName: app.serverType, Sign: 'ddcat' }, sendPack)
    },

    //----------------------------- http 请求接口---------------------------------

    // 创建http请求
    createPromiseHttpSend: function(method, url, dataDict, sendPack) {
        if (method == 'POST') {
            return this.httpPost(url, dataDict, sendPack)
        } else {
            return this.httpGet(url, dataDict)
        }
    },

    // 创建http post请求
    httpPost: function(url, dataDict, sendPack) {
        var queryString = this.GetUrlStr(dataDict)
        var options = {
            method: 'POST',
            uri: [url, queryString].join(''),
            body: sendPack,
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true
        }

        return requestPromise(options)
    },

    // 创建http Get请求
    httpGet: function(url, dataDict) {
        var options = {
            uri: url,
            qs: dataDict,
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true
        }

        return requestPromise(options)
    }
})

exports.getInstance = HttpPackManager.getInstance
