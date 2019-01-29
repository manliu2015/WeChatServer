/*
 * 	DangLeManager.js
 * 	当乐网SDK
 *
 *	author:hongdian
 *	date:2014-10-28
 *	version:1.0
 *
 * 修改时间 修改人 修改内容:
 *
 *
 */

app.Log("import DangLeManager.js");
var cryptoJS = require("crypto-js");
var crypto = require("crypto");


/*
 * 类方法定义
 */
var DangLeManager = app.BaseClass.extend({

	/**
	 * new 对象 会调用的构造函数
	 */
	Init:function(){
		this.JS_Name = "DangLeManager";

        this.AppKey = "FP1cjF7v";
        this.AppID = "50059";
        this.AppSecret = "AYEGqbAp15rm";
        this.AccountValidityUrl = 'http://h5sdk.d.cn/api/cp/getUserInfo'

        this.HttpPackManager = app.HttpPackManager();

		this.Log("Init");
	},

    /**
     * 请求账号合法性
     */
    RequestAccountValidity:function(token){

    	var tick = Date.now();

        var argDict = {
                          "appId":this.AppID,
                          "cpToken":token,
                          "timestamp":tick,
                         }

        var argList = Object.keys(argDict);
        argList.sort();
        var count = argList.length;

        var signatureStr = "";
        for(var index=0; index<count; index++){
            var keyName = argList[index];
            signatureStr += keyName + '=' + argDict[keyName] + '&';
        }
		//去掉最后一个&
		signatureStr = signatureStr.substring(0, signatureStr.length-1) + this.AppKey;

		//var signature = cryptoJS.MD5(signatureStr).toString();
		var signature = crypto.createHash('md5').update(signatureStr).digest('hex').toLowerCase();

		argDict["sig"] = signature

        var that = this;

        return this.HttpPackManager.CreatePromiseHttpSend("GET", this.AccountValidityUrl, argDict, {})
        							.then(function(resultInfo){

        								resultInfo = JSON.parse(resultInfo);

        								if(resultInfo["code"] == 0){
        									return {
										                "uid":resultInfo["data"]["unionId"],
										                "nickName":resultInfo["data"]["nickName"],
										                "sex":0,
										                "headImageUrl":"",
										                "token":"",
									                }
        								}
        								else{
    										that.ErrLog("resultInfo:%j,%j", argDict, resultInfo);
        								}

        							})
    }

})

var g_DangLeManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
    if(!g_DangLeManager){
        g_DangLeManager = new DangLeManager();
    }
    return g_DangLeManager;
}