/**
 * Created by guoliangxuan on 2017/3/16.
 */
app.Log("import WeChatAppManager.js");
var cryptoJS = require("crypto-js");
var crypto = require("crypto");
var bluebird = require("bluebird");
var path = require("path");
var fs = require("fs");

/*
 * 类方法定义
 */
var WeChatAppManager = app.BaseClass.extend({
    /**
     * new 对象 会调用的构造函数
     */
    Init:function() {
        this.JS_Name = "WeChatAppManager";

        //个人信息授权url
        this.AccountUserInfoUrl = "https://api.weixin.qq.com/sns/userinfo";
        //刷新token Url
        this.RefreshTokenUrl = "https://api.weixin.qq.com/sns/oauth2/refresh_token";
        //获取access Url
        this.AccessTokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token";

        this.HttpPackManager = app.HttpPackManager();
        this.ShareDefine = app.ShareDefine();
        this.LocalDataManager = app.LocalDataManager();
        this.SysDataManager = app.SysDataManager();
        this.WeChatManager = app.WeChatManager();
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
    },

    RequestAccountValidityForApp:function(mpID, code, sdkAccountID){

	    this.mpAccessTokenDict = this.WeChatManager.GetWeChatAccessTokenInfo();
	    var mpAccessTokenDict = this.mpAccessTokenDict[mpID];
	    if(!mpAccessTokenDict){
		    this.ErrLog("RequestAccountValidity not find mpID(%s)", mpID);
		    return bluebird.resolve(null)
	    }
	    var appid = mpAccessTokenDict["appid"];
	    var secret = mpAccessTokenDict["secret"];

	    //如果使用缓存的token登录
	    if(sdkAccountID){
		    return this.RequestAccountValidityByCache(appid, code, sdkAccountID);
	    }

        var argDict = {
			            "appid":appid,
			            "secret":secret,
			            "code":code,
			            "grant_type":"authorization_code",
			        };

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

                resultInfo["endTick"] = Date.now() + Math.floor(resultInfo["expires_in"]*1000*2/3);
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
                //playerInfo:{"
                // openid":"oORtQ1DSDUlM55gxhVJ7rWKMKN_Y",
                // "nickname":"郭良烜",
                // "sex":1,
                // "language":"zh_CN",
                // "city":"厦门",
                // "province":"福建",
                // "country":"中国",
                // "headimgurl":"http://wx.qlogo.cn/mmopen/HHdYIltf4HXgpogBhDceonraQO8bah0oDmicNBrvxDfPczGGmoHCKz1QjCuFCbmZJZSoh4nhiaDIIGXpu3GpXiafvqD618wE3bD/0",
                //privilege":[],
                // "unionid":"ocXJrw7espBL3clGHqD2VXBtIG7Y"
                // }
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

	            tokenInfo["appid"] = appid;
	            tokenInfo["secret"] = secret;

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

	RequestAccountValidityByCache:function(appid, sdkToken, sdkAccountID){
		var uid = app.AccountManager().GetAccountProperty(sdkAccountID, "CharAccount");
		if(!this.uidInfoDict.hasOwnProperty(uid)){
			this.ErrLog("RequestAccountValidityByCache(%s,%s) not find uid, %s", sdkToken, sdkAccountID, uid);
			return bluebird.resolve(null)
		}
		var uidInfoDict = this.uidInfoDict[uid];
		if(!uidInfoDict.hasOwnProperty("TokenInfo")){
			this.ErrLog("RequestAccountValidityByCache not find TokenInfo");
			return bluebird.resolve(null)
		}
		if(!uidInfoDict.hasOwnProperty("PlayerInfo")){
			this.ErrLog("RequestAccountValidityByCache not find PlayerInfo");
			return bluebird.resolve(null)
		}

		var tokenInfo = uidInfoDict["TokenInfo"];
		var playerInfo = uidInfoDict["PlayerInfo"];

		if(tokenInfo["access_token"] != sdkToken){
			return bluebird.resolve(null)
		}
		else{

			var sex = playerInfo["sex"];
			//男
			if(sex == "1"){
				sex = this.ShareDefine.HeroSex_Boy;
			}
			else if(sex == "2"){
				sex = this.ShareDefine.HeroSex_Girl;
			}
			else{
				sex = this.ShareDefine.HeroSex_Boy;
			}
			var dataInfo = {
							"uid":playerInfo["unionid"],
							"sex":sex,
							"nickName":playerInfo["nickname"],
							"headImageUrl":playerInfo["headimgurl"],
							"token":sdkToken,
							"openid":playerInfo["openid"],
						}

			this.SysLog("RequestAccountValidityByCache(%s) dataInfo:%j", sdkAccountID, dataInfo);
			return bluebird.resolve(dataInfo)
		}
	},

	//半小时判断一次刷新token
	OnHalfHour:function(nowDate){
		var nowTick = nowDate.getTime();

		var allUidList = Object.keys(this.uidInfoDict);
		var that = this;

		var count = allUidList.length;
		for(var index=0; index<count; index++){
			var uid = allUidList[index];
			var tokenInfo = this.uidInfoDict[uid]["TokenInfo"];
			if(!tokenInfo){
				delete this.uidInfoDict[uid];
				this.ErrLog("OnHalfHour uid(%s) not find TokenInfo", uid);
				continue
			}
			//还没到刷新时间
			if(nowTick < tokenInfo["endTick"]){
				continue
			}

			var appID = tokenInfo["appid"];
			var refresh_token = tokenInfo["refresh_token"];

			var argDict = {
							"appid":appID,
							"grant_type":"refresh_token",
							"refresh_token":refresh_token,
						};
			this.HttpPackManager.CreatePromiseHttpSend("GET", this.RefreshTokenUrl, argDict, {})
				.then(function(resultInfo){
					that.OnRefreshToken(uid, resultInfo);
				})
				.catch(function(error){
					that.ErrLog("OnHalfHour(%j) error:%s", argDict, error.stack);
				})
		}

	},

	OnRefreshToken:function(uid, resultInfo){

		this.SysLog("OnRefreshToken(%s) resultInfo:%j", uid, resultInfo);
		if(resultInfo["errcode"]){
			this.ErrLog("OnRefreshToken(%s) resultInfo:%j", uid, resultInfo);
			delete this.uidInfoDict[uid];
			return
		}
		if(!this.uidInfoDict.hasOwnProperty(uid)){
			this.ErrLog("OnRefreshToken not find uid:%s", uid);
			return
		}
		var tokenInfo = this.uidInfoDict[uid]["TokenInfo"];
		this.SysLog("tokenInfo:%j", tokenInfo);
		tokenInfo["endTick"] = Date.now() + Math.floor(resultInfo["expires_in"]*1000*2/3);
		tokenInfo["refresh_token"] = resultInfo["refresh_token"];
		tokenInfo["access_token"] = resultInfo["access_token"];
	},

});

var g_WeChatAppManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
    if(!g_WeChatAppManager){
        g_WeChatAppManager = new WeChatAppManager();
    }
    return g_WeChatAppManager;
}