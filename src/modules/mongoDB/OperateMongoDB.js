// OperateMongoDB.js
// Create by manliu Jan/27/2019
// 操纵 Mongo DB

var mongoose = require('mongoose')
var bluebird = require('bluebird')

// 指定bluebird模块
mongoose.Promise = bluebird

var OperateMongoDB = SingleClass.extend('OperateMongoDB', {
    init: function() {
        // 数据库连接完毕回调
        this.dbConnectedCallback = null

        // 数据库名对应的db连接池
        this.mongoDBDict = {}

        // 数据库配置信息
        this.dbNameInfoDict = {}
    },

    // 初始化数据库
    initDB: function(dbInfo, callback) {
        var dbName = dbInfo.dbName
        if (!dbName) {
            this.E('must has dbName.')
            callback()
            return
        }

        if (this.mongoDBDict.hasOwnProperty(dbName)) {
            // 已经链接过该数据库了
            this.E('mongoDBDict already connect DB:%s pathName:%s error', dbName, pathName)
            return
        }

        if (this.dbNameInfoDict.hasOwnProperty(dbName)) {
            // 该数据库已经搭上标记，可能正在连接
            this.E('dbNameInfoDict already has db:%s pathName:%s error', dbName, pathName)
            return
        }

        this.dbNameInfoDict[dbName] = dbInfo
        var opts = {
            useNewUrlParser: true
        }

        this.S(
            'try connect mongodb(%s:%s/%s),User(%s,%s)',
            dbInfo.dbIP,
            dbInfo.dbPort,
            dbInfo.dbName,
            dbInfo.dbUserName,
            dbInfo.dbUserPsw
        )

        var conUri = [
            'mongodb://',
            dbInfo.dbUserName,
            ':',
            dbInfo.dbUserPsw,
            '@',
            dbInfo.dbIP,
            ':',
            dbInfo.dbPort,
            '/',
            dbInfo.dbName
        ]
        var mongoDB = mongoose.createConnection(conUri.join(''), opts)
        var that = this
        mongoDB.on('error', function(error) {
            that.onError(dbName, error, callback)
        })
        mongoDB.on('connected', function(error) {
            that.onConnected(dbName, error, callback)
        })
        mongoDB.on('disconnected', function(error) {
            that.onDisconnected(dbName, error)
        })
        this.mongoDBDict[dbName] = mongoDB
    },

    // 链接数据库错误回调
    onError: function(dbName, error, callback) {
        if (error) {
            delete this.mongoDBDict[dbName]
            delete this.dbNameInfoDict[dbName]
            this.E('onError Connection error:%s', error)
        }

        if (callback) {
            callback(error)
        }
    },

    // 链接数据库成功回调
    onConnected: function(dbName, error, callback) {
        if (error) {
            delete this.mongoDBDict[dbName]
            delete this.dbNameInfoDict[dbName]
            this.E('mongo db connect fail:%s.', error)
        } else {
            this.S('mongo(%s) connect succ!', dbName)
        }

        if (callback) {
            callback(error)
        }
    },

    // 断开数据库链接回调
    onDisconnected: function(dbName, error) {
        if (error) {
            this.E('onDisconnected error:%s', error)
        }
        delete this.mongoDBDict[dbName]
        delete this.dbNameInfoDict[dbName]

        this.S('mongodb(%s) disconnect.', dbName)
    },

    //获取指定数据库连接池
    getMongoDB: function(dbName) {
        if (!this.mongoDBDict.hasOwnProperty(dbName)) {
            this.E('getMongoDB(%s) not find', dbName)
            return
        }
        return this.mongoDBDict[dbName]
    },

    // 获取数据是是否立即保存模式
    isImmediatelySave: function(dbName) {
        if (!this.dbNameInfoDict.hasOwnProperty(dbName)) {
            this.E('isImmediatelySave(%s) not find', dbName)
            return false
        }

        return this.dbNameInfoDict[dbName]['isImmediatelySave']
    }
})

exports.getInstance = OperateMongoDB.getInstance
