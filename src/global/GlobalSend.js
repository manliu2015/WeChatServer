// GlobalSend.js
// Create by manliu Jan/27/2019
// 通讯消息定义

var GlobalSend = SingleClass.extend('GlobalSend', {
    init: function() {},

    // 客户端发送给服务器的封包
    ClientHttpPackDict: {
        'client.0xFF00.wcs': 'OneKeyRegAccount'
    }
})

exports.getInstance = GlobalSend.getInstance
