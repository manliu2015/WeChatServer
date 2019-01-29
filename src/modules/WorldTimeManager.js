/*
 * 	WorldTimeManager.js
 * 	世界时间管理器
 *
 *	author:hongdian
 *	date:2014-10-28
 *	version:1.0
 *
 * 修改时间 修改人 修改内容:
 *
 *
 */

var pomeloschedule = require("pomelo-scheduler");
var schedule = require("node-schedule");
app.Log("import WorldTimeManager.js");


/*
 * 类方法定义
 */
var WorldTimeManager = app.BaseClass.extend({

	/**
	 * new 对象 会调用的构造函数
	 */
	Init:function(){
		this.JS_Name = "WorldTimeManager";
		// this.MongoDBManager = app.MongoDBManager();
		this.ServerManager = app.ServerManager();
		this.LocalDataManager = app.LocalDataManager();
		this.WeChatManager = app.WeChatManager();
		// this.WorldPerDayThingManager = app.WorldPerDayThingManager();
		// this.PlayerManager = app.PlayerManager();
	    this.tick = 0;
		this.Log("create WorldTimeManager");
	},


	/**
	 * 注册回调
	 */
    RegSchedule:function(){
        var rule, ComTool, valueList;

		ComTool = app.ComTool();

	    //每个月回调
	    rule = new schedule.RecurrenceRule();
	    rule.date = 1;
	    rule.hour = 0;
	    rule.minute = 0;
	    schedule.scheduleJob(rule, this.OnMonth.bind(this));

		//每分钟回调
	    rule = new schedule.RecurrenceRule();
	    valueList = ComTool.Range(0, 60);
	    rule.minute = valueList;
	    schedule.scheduleJob(rule, this.OnMinuteEvent.bind(this));

		//每秒回调
	    rule = new schedule.RecurrenceRule();
	    valueList = ComTool.Range(0, 60);
	    rule.second = valueList;
	    schedule.scheduleJob(rule, this.OnSecond.bind(this));
    },


	/**
	 * 注册指定日期回掉上述
	 */
    RegOneSchedule:function(dateTime, userData, callback){

	    //[0,59],[0,59],[0,24],[1,31],[0,11],[0,6]
	    //"0 0 0 1 0 *" 1月1号 如果传字符串
	    var timeString = "";

	    if(typeof(dateTime) == "string"){
	    	timeString = dateTime;
	    }
	    else{
	    	timeString = [dateTime.getSeconds(), dateTime.getMinutes(), dateTime.getHours(), dateTime.getDate(), dateTime.getMonth(), "*"].join(" ");
	    }
	    

	    pomeloschedule.scheduleJob(timeString, callback, userData);
    },

	/**
	 * 初始化完成回调
	 */
	OnServerInitOK:function(){
		this.RegSchedule();
	},
	
	/**
	 * 100毫秒定时回调
	 */
    OnTimer:function(){

    },

	/**
	 * 每秒定时回调
	 */
    OnSecond:function(){
		var nowTick = Date.now();
		//this.MongoDBManager.OnSecond(nowTick);
		this.LocalDataManager.OnSecond(nowTick);
    },

    /**
     * 1分钟回调一次
     */
    OnMinuteEvent:function(){
		var nowDate = new Date();

		var hour = nowDate.getHours();
		var min = nowDate.getMinutes();
		var second = nowDate.getSeconds();

		this.SysLog("OnMinute(%s:%s:%s)", hour, min, second);

    	try{

			if(this.ServerManager.IsServerStart()){

				this.OnMinute(nowDate);

				if(min == 30){
					this.OnHalfHour(nowDate);
				}

				if(min == 0){
					this.OnHour(nowDate);
					//this.MongoDBManager.OnHour(nowDate);
				}

				if(hour == 0 && min == 0){
					this.OnDay(nowDate);
				}
			}

			//this.MongoDBManager.OnMinute(nowDate);
    	}
    	catch(e){
    		this.ErrLog("OnMinute:%s, %s, %s", e.name, e.message, e.stack);
    	}
    },

	/**
	 * 分钟事件
	 */
    OnMinute:function(nowDate){
		//this.WorldPerDayThingManager.OnMinute(nowDate);
    },

	/**
	 * 半点事件
	 */
    OnHalfHour:function(nowDate){
    	this.SysLog("OnHalfHour:%s", nowDate.toLocaleString());
		app.WeChatAppManager().OnHalfHour(nowDate);
    },

	/**
	 * 每个整点回调
	 */
    OnHour:function(nowDate){
		this.SysLog("OnHour:%s", nowDate.toLocaleString());
		//this.WorldPerDayThingManager.OnHour(nowDate);

    },

	/**
	 * 天变化回调
	 */
    OnDay:function(nowDate){

		this.SysLog("OnDay:%s", nowDate.toLocaleString());

		//this.PlayerManager.OnDay(nowDate);

		//this.WorldPerDayThingManager.OnDay(nowDate);

    },

    /**
     * 月变化回调
     */
    OnMonth:function(){
    	var nowDate = new Date();
    	this.SysLog("OnMonth:%s", nowDate.toLocaleString());

    	try{
			if(this.ServerManager.IsServerStart()){
				//this.WorldPerDayThingManager.OnMonth(nowDate);
			}
    	}
    	catch(e){
    		this.ErrLog("OnMonth:%s, %s, %s", e.name, e.message, e.stack);
    	}
    },


})

var g_WorldTimeManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
    if(!g_WorldTimeManager){
        g_WorldTimeManager = new WorldTimeManager();
    }
    return g_WorldTimeManager;
}