// FF00_OneKeyRegAccount.js
// Create by manliu Jan/27/2019
// 一键注册

var FF00_OneKeyRegAccount = SingleClass.extend('FF00_OneKeyRegAccount', {
    init: function() {},

    // 数据处理
    onReceivePack: function(senderInfo, receivePack) {
        var senderIP = senderInfo.senderIP
        if (!senderIP) {
            this.E('senderInfo:%j not find IP.', senderInfo)
            senderIP = '127.0.0.1'
        }

        // var that = this
        // return this.AccountManager.CreateAccountBySeqKey(senderIP)
        //     .then(function(accountID) {
        //         if (!accountID) {
        //             that.E('CreateAccountBySeqKey 创建账号失败')
        //             return
        //         }
        //         return that.AccountManager.GetAccountLoginSendPack(accountID)
        //     })
        //     .catch(function(error) {
        //         that.ErrLog('CreateAccountBySeqKey error:%s', error.stack)
        //     })
    }
})

exports.getInstance = FF00_OneKeyRegAccount.getInstance
