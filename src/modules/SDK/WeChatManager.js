/*
 * 	WeChatManager.js
 * 	微信SDK
 *
 *	author:hongdian
 *	date:2014-10-28
 *	version:1.0
 *
 * 修改时间 修改人 修改内容:
 *
 *
 */

app.Log("import WeChatManager.js");
var cryptoJS = require("crypto-js");
var crypto = require("crypto");
var bluebird = require("bluebird");
var path = require("path");
var fs = require("fs");


/*
 * 类方法定义
 */
var WeChatManager = app.BaseClass.extend({

	/**
	 * new 对象 会调用的构造函数
	 */
	Init:function(){
		this.JS_Name = "WeChatManager";

		//个人信息授权url
		this.AccountUserInfoUrl = "https://api.weixin.qq.com/sns/userinfo";
		//刷新token Url
		this.RefreshTokenUrl = "https://api.weixin.qq.com/sns/oauth2/refresh_token";
		//获取access Url
		this.AccessTokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token";

		//获取公众号玩家数据
		this.GongZhonghaoUserInfoUrl = "https://api.weixin.qq.com/cgi-bin/user/info";


		this.HttpPackManager = app.HttpPackManager();
		this.ShareDefine = app.ShareDefine();
		this.LocalDataManager = app.LocalDataManager();
		this.SysDataManager = app.SysDataManager();

		//uid缓存字典
		//{
		//	uid:{
		//			"TokenInfo": {
		//							"access_token":"N1447yyNChj9tXvllNm4tGfGEEwTXOo9JLmGXdWS_9nc4S1KGRZMhZqFbcJdKOREKKXZ_fZYtqfugr1vLnLKm0V0W1L1etf-3RvtN7pvwCM",
		//							"expires_in":7200,
		//							"refresh_token":"tZ_h9LbSKsGn5EuZI8GyWchFcHsZNoho25Zx9SZDXLzAUEhTWw7LF1y-ic4MnxddoD1FGi0K7fveyQQt7USLdi_X2fH2vLdk9DN3Um4MOqw",
		//							"openid":"ohkcYwb-fIZbV5PYN80P8dsGvrJ4",
		//							"scope":"snsapi_userinfo",
		//							"unionid":"ocXJrw8lPbXGEqQ27ALpQMztkNZw",
		//							"endTick":1483116221298
		//						} ,
		//          "PlayerInfo":{
		//							"openid":"ohkcYwb-fIZbV5PYN80P8dsGvrJ4",
		//							"nickname":"红点",
		//							"sex":1,
		//							"language":"zh_CN",
		//							"city":"福州",
		//							"province":"福建",
		//							"country":"中国",
		//							"headimgurl":"http://wx.qlogo.cn/mmopen/ajNVdqHZLLDvjIbdE4KgeKwaVydDvsLvicYYxiaolbib4vfz2L5VPy436bNKXROALdIFwVnFg8myB7j7uyEyNSAlg/0",
		//							"privilege":[],
		//							"unionid":"ocXJrw8lPbXGEqQ27ALpQMztkNZw"
		//						},
		//	}
		//}
		this.uidInfoDict = {};

		//账号token信息临时缓存字典
		//{
		//	uid:{
		//			"access_token":"N1447yyNChj9tXvllNm4tGfGEEwTXOo9JLmGXdWS_9nc4S1KGRZMhZqFbcJdKOREKKXZ_fZYtqfugr1vLnLKm0V0W1L1etf-3RvtN7pvwCM",
		//			"expires_in":7200,
		//			"refresh_token":"tZ_h9LbSKsGn5EuZI8GyWchFcHsZNoho25Zx9SZDXLzAUEhTWw7LF1y-ic4MnxddoD1FGi0K7fveyQQt7USLdi_X2fH2vLdk9DN3Um4MOqw",
		//			"openid":"ohkcYwb-fIZbV5PYN80P8dsGvrJ4",
		//			"scope":"snsapi_userinfo",
		//			"unionid":"ocXJrw8lPbXGEqQ27ALpQMztkNZw",
		//			"endTick":1483116221298
		//		},
		//}
		this.tempTokenInfoDict = {};

		//公众号token缓存字典
		//公众号token缓存字典
		//{
		//	mpid:{
		//			"appid":"xxxx",
		//			"secret":"xxxx",
		//			"access_token":"xxxx",
		//			"expires_in":7200,
		//			"endTick":4555566,
		//			"jsapi_ticket":"",
		//			"mch_id":"",
		//			"LockKey":"",
		//		}
		//}
		this.mpAccessTokenDict = {};

		this.Log("Init");
	},

	//初始化所有微信公众号token
	OnServerInitOK:function(){
		this.RequestWeChatAccessTokenInfo();
	},

	/**
	 * 请求账号合法性
	 */
	RequestAccountValidity:function(mpID, code){

		var mpAccessTokenDict = this.mpAccessTokenDict[mpID];
		if(!mpAccessTokenDict){
			this.ErrLog("RequestAccountValidity not find mpID(%s)", mpID);
			return bluebird.resolve(null)
		}
		var argDict = {
							"appid":mpAccessTokenDict["appid"],
							"secret":mpAccessTokenDict["secret"],
							"code":code,
							"grant_type":"authorization_code",
						}

		var that = this;

		return this.HttpPackManager.CreatePromiseHttpSend("GET", this.AccessTokenUrl, argDict, {})
					.then(function(resultInfo){

						if(resultInfo["errcode"]){
							that.ErrLog("RequestAccountValidity argDict(%j):(%j)", argDict, resultInfo);
							return
						}
						//{
						//	"access_token":"N1447yyNChj9tXvllNm4tGfGEEwTXOo9JLmGXdWS_9nc4S1KGRZMhZqFbcJdKOREKKXZ_fZYtqfugr1vLnLKm0V0W1L1etf-3RvtN7pvwCM",
						//	"expires_in":7200,
						//	"refresh_token":"tZ_h9LbSKsGn5EuZI8GyWchFcHsZNoho25Zx9SZDXLzAUEhTWw7LF1y-ic4MnxddoD1FGi0K7fveyQQt7USLdi_X2fH2vLdk9DN3Um4MOqw",
						//	"openid":"ohkcYwb-fIZbV5PYN80P8dsGvrJ4",
						//	"scope":"snsapi_userinfo",
						//	"unionid":"ocXJrw8lPbXGEqQ27ALpQMztkNZw",
						//	"endTick":1483116221298
						//}
						that.SysLog("resultInfo(%j)", resultInfo);

						resultInfo["endTick"] = Date.now() + resultInfo["expires_in"]*1000;
						var accessToken = resultInfo["access_token"];
						var openid = resultInfo["openid"];

						if(!resultInfo.hasOwnProperty("unionid")){
							resultInfo["unionid"] = openid;
						}
						var unionid = resultInfo["unionid"];
						if(!unionid){
							that.ErrLog("resultInfo(%j) not find unionid", resultInfo);
							return
						}
						//缓存起来
						that.tempTokenInfoDict[unionid] = resultInfo;

						argDict = {
											"access_token":accessToken,
											"openid":openid,
											"lang":"zh_CN",
										}
						return that.HttpPackManager.CreatePromiseHttpSend("GET", that.AccountUserInfoUrl, argDict, {})
					})
					.then(function(playerInfo){
						if(!playerInfo){
							return
						}

						if(playerInfo["errcode"]){
							that.ErrLog("access_token 获取微信玩家数据失败%j", playerInfo);
							return
						}

						that.SysLog("playerInfo:%j", playerInfo);
						//{
						//	"openid":"ohkcYwb-fIZbV5PYN80P8dsGvrJ4",
						//	"nickname":"红点",
						//	"sex":1,
						//	"language":"zh_CN",
						//	"city":"福州",
						//	"province":"福建",
						//	"country":"中国",
						//	"headimgurl":"http://wx.qlogo.cn/mmopen/ajNVdqHZLLDvjIbdE4KgeKwaVydDvsLvicYYxiaolbib4vfz2L5VPy436bNKXROALdIFwVnFg8myB7j7uyEyNSAlg/0",
						//	"privilege":[],
						//	"unionid":"ocXJrw8lPbXGEqQ27ALpQMztkNZw"
						//}
						//只有设置了公众号绑定到开发者账号才会存在unionid
						var openid = playerInfo["openid"];
						if(!openid){
							that.ErrLog("playerInfo(%j) not find openid", playerInfo);
							return
						}
						if(!playerInfo.hasOwnProperty("unionid")){
							playerInfo["unionid"] = openid;
						}
						var unionid = playerInfo["unionid"];
						if(!unionid){
							that.ErrLog("playerInfo(%j) not find unionid", playerInfo);
							return
						}

						var tokenInfo = that.tempTokenInfoDict[unionid];
						if(!tokenInfo){
							that.ErrLog("tempTokenInfoDict not find:%s", unionid);
							return
						}
						var accessToken = tokenInfo["access_token"];
						//删除掉记录
						delete that.tempTokenInfoDict[unionid];

						//缓存数据
						that.uidInfoDict[unionid] = {
														"TokenInfo":tokenInfo,
														"PlayerInfo":playerInfo,
													};

						var sex = playerInfo["sex"];
						//男
						if(sex == "1"){
							sex = that.ShareDefine.HeroSex_Boy;
						}
						else if(sex == "2"){
							sex = that.ShareDefine.HeroSex_Girl;
						}
						else{
							sex = that.ShareDefine.HeroSex_Boy;
						}
						return {
									"uid":unionid,
									"sex":sex,
									"nickName":playerInfo["nickname"],
									"headImageUrl":playerInfo["headimgurl"],
									"token":accessToken,
									"openid":openid,
									"unionid":unionid,
								}
					})
	},


	//获取微信公众号授权字典信息
	GetWeChatMPInfoByMPID:function(mpID){

		var mpAccessTokenDict = this.mpAccessTokenDict[mpID];
		if(!mpAccessTokenDict){
			this.ErrLog("GetWeChatMPInfoByMPID(%s) not find", mpID);
			return
		}
		return mpAccessTokenDict
	},

	//获取公众号属性值
	GetWeChatMPProperty:function(mpID, property){
		var mpAccessTokenDict = this.mpAccessTokenDict[mpID];
		if(!mpAccessTokenDict){
			this.ErrLog("GetWeChatMPProperty(%s,%s) not find appID", mpID, property);
			return
		}
		if(!mpAccessTokenDict.hasOwnProperty(property)){
			this.ErrLog("GetWeChatMPProperty(%s,%s) not find property", mpID, property);
			return
		}
		return mpAccessTokenDict[property];
	},

	GetWeChatAccessTokenInfo:function(){
		return this.mpAccessTokenDict
	},

	SetWeChatAccessTokenInfo:function(mpAccessTokenDict){
		this.mpAccessTokenDict = mpAccessTokenDict;
	},

	//获取玩家的账号数据通过uid
	GetPlayerInfoByUid:function(uid){
		var uidInfoDict = this.uidInfoDict[uid];
		if(!uidInfoDict){
			this.ErrLog("GetPlayerInfoByUid not find(%s)", uid);
			return
		}
		return uidInfoDict["PlayerInfo"];
	},

	GetGongZhonghaoUserInfoUrl:function(){
		return this.GongZhonghaoUserInfoUrl
	},


	//请求微信授权信息
	RequestWeChatAccessTokenInfo:function(){
		var sendPack = this.HttpPackManager.GetHttpSendServerPack("wechat", 0x0007);
		var that = this;

		this.HttpPackManager.SendHttpPack(sendPack)
			.then(function(returnDict){
				that.SysLog("RequestWeChatAccessTokenInfo:%j", returnDict);
				that.SetWeChatAccessTokenInfo(returnDict);
			})
			.catch(function(error){
				that.Log("RequestWechat(%j) WeChatServe未开启", sendPack);
			})
	},



})

var g_WeChatManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
	if(!g_WeChatManager){
		g_WeChatManager = new WeChatManager();
	}
	return g_WeChatManager;
}