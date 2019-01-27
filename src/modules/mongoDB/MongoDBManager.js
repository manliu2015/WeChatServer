// MongoDBManager.js
// Create by manliu Jan/27/2019
// 数据库管理

var OperateMongoDB = require('./OperateMongoDB').getInstance()

var MongoDBManager = SingleClass.extend('MongoDBManager', {
    init: function() {
        this.dbTableDict = {}
        this.subDBTableDict = {}

        // 每分钟保存玩家数据个数
        this.PerSecondSaveHeroCount = 100

        // 每分钟定时保存多少个被修改的玩家数据
        this.PerMinuteSaveChangeHeroCount = 50

        // 等待保存数据的玩家ID列表
        this.waitSaveHeroIDList = []

        this.HeroTableNameList = ['tagHeroInfo', 'tagPlayerActivity']
    },

    prepare: function() {
        var dbIP = cfg.mongoDBIP
        var dbPort = cfg.mongoDBPort
        var dbName = cfg.mongoDBName
        var dbUserName = cfg.mongoDBUserName
        var dbUserPsw = cfg.mongoDBUserPsw
        var dbInfo = {
            dbIP: dbIP,
            dbPort: dbPort,
            dbName: dbName,
            dbUserName: dbUserName,
            dbUserPsw: dbUserPsw
        }

        OperateMongoDB.initDB(dbInfo, function() {})
    }
})

exports.getInstance = MongoDBManager.getInstance
