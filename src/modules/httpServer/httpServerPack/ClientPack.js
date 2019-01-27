// ClientPack.js
// Create by manliu 27/Jan/2019
// 实现客户端封包

exports.Pack = function(req, res) {
    try {
        if (!isInitDone()) {
            // 服务器未初始化完毕
            return
        }

        if (!HttpServerManager.isEnable()) {
            logger.I('http server is not enable.')
            res.send({ code: Const.HTTP_SERVER_NO_ENABLE })
            return
        }

        var pack = req.body
        var argDict = req.query
        var sign = argDict['Sign']

        var ipList = req.ip.split(':')
        var loginIP = ipList[ipList.length - 1]

        HttpPackManager.onReceivePack('Client', res, loginIP, 'Client', sign, pack)
    } catch (e) {
        logger.E('Client(%j) pack (%j) action fail,%s,%s,%s.', argDict, pack, e.name, e.message, e.stack)

        res.send({ code: Const.HTTP_PACK_RUN_ERROR })
        return
    }
}
