/*
 *  AccountManager.js
 *  玩家账号管理器
 *
 *  author:hongdian
 *  date:2014-10-28
 *  version:1.0
 *
 * 修改时间 修改人 修改内容:
 *
 *
 */

var mongoose = require("mongoose");
var bluebird = require("bluebird");
var crypto = require("crypto");
app.Log("import AccountManager.js");


/*
 * 类方法定义
 */
var AccountManager = app.BaseClass.extend({

    /**
     * 初始化
     */
    Init:function(){
        this.JS_Name = "AccountManager";

        this.ComTool = app.ComTool();
        this.ShareDefine = app.ShareDefine();
        this.HttpPackManager = app.HttpPackManager();

        //密码正则表达式(长度5~11之间,只能包含字符,数字和下划线)
        this.PswReg = /^(\w){5,11}$/;
        //账号正则表达式(字符开头,长度5~16之间,只能包含字符,数字和下划线)
        this.AccountReg = /^[a-zA-Z]\w{4,15}$/;


        //{"CharAccount":AccountID}
        this.charAccountDict = {};

        //绑定解绑验证码
        this.bindAccountCodeDict = {};
        this.unBindAccountCodeDict = {};

        this.PswLen = 6;
        this.PswNumList = [1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f","g","h","i","j","k","m","n","r","s","t","u","v","w","x","y","z"];

        //获取数据管理器
        this.dataMgr = app.MongoDBManager().AddDBMainTable("tagAccountInfo");

	    this.accountTokenDict = {};

        this.Log("Init");
    },

    /**
     * 加载所有账号所有字段数据
     */
    LoadAllAccountData:function(){
        var propertyNameList = this.dataMgr.GetPropertyNameList();
        return this.dataMgr.LoadAllDataByFieldNameList(propertyNameList, true);
    },

    /**
     * 加载数据
     */
    AutoInitData:function(accountID){
        return this.dataMgr.LoadDataByKeyID(accountID);
    },

    /**
     * 开服初始化
     */
    OnServerInitOK:function(){
        var that = this;

        return this.dataMgr.LoadAllData()

                    //加载数据到内存后回调
                    .then(function(allDataDict){

                        var accountIDList = Object.keys(allDataDict);
                        var count = accountIDList.length;

                        for(var index=0; index<count; index++){
                            var accountID = accountIDList[index];

                            var charAccount = allDataDict[accountID]["CharAccount"];
                            if(!charAccount){
                                that.ErrLog("OnServerInitOK(%s) not charAccount", accountID);
                                continue
                            }

                            if(that.charAccountDict.hasOwnProperty(charAccount)){
                                that.ErrLog("OnServerInitOK (%s, %s) have find(%s)", charAccount, accountID, that.charAccountDict[charAccount]);
                                continue
                            }
                            that.charAccountDict[charAccount] = accountID;
                        }

                    })

                    .catch(function(error){
                        that.ErrLog("OnServerInitOK error:%s", error.stack);
                    });
    },

    /**
     *  初始化
     */
    PlayerLogin:function(accountID){
        return this.AutoInitData(accountID);
    },


    /**
     * 创建一个随机密码
     */
    CreateRandPsw:function(){
	    return "123456";
        //var numList = this.ComTool.ListSample(this.PswNumList, this.PswLen);
        //return numList.join("")
    },

    /**
     * 创建账号
     */
    CreateAccountBySeqKey:function(playerIP){

        var accountID = app.DBDataKeyManager().GetDBDataKeyByProperty("AccountID");
        if(!accountID){
            this.ErrLog("CreateAccountBySeqKey accountID:%s error", accountID);
            return bluebird.reject(new Error("create AccountID fail"))
        }

	    var accountType = 0;
	    var charAccount = accountID + "";

        var nowDate = new Date();
        var registerTime = nowDate.toLocaleString();
	    //随机一个密码
	    var charAccountPsw = this.CreateRandPsw();

        var initData = {
		                    "CharAccount":charAccount,
		                    "CharAccountPsw":charAccountPsw,
		                    "LoginTime":nowDate.getTime(),

		                    "AccountType":accountType,
		                    "IsBind":0,
		                    "AccountState":0,

		                    "RegisterTime":registerTime,
		                    "RegisterIP":playerIP,
		                    "PhoneNum":"",
		                    "LoginIPList":[playerIP],
		                 };

        var that = this;

        return this.dataMgr.CreateNewDataByKey(accountID, initData)
                            .then(function(result){

                                if(!result){
                                    that.ErrLog("CreateAccountBySeqKey(%s,%j)创建失败", accountID, initData);
                                    return null
                                }
                                that.charAccountDict[charAccount] = accountID;
                                return accountID
                            })
                            .catch(function(error){
                                that.ErrLog("CreateAccountBySeqKey(%s,%j) error:%s", accountID, initData, error.stack);
                            })

    },
    /**
     * 创建账号
     */
    CreateAccountByCharAccount:function(charAccount, charAccountPsw, accountType, playerIP, phoneNum){

        var accountID = app.DBDataKeyManager().GetDBDataKeyByProperty("AccountID");
        if(!accountID){
            this.ErrLog("CreateAccountByCharAccount accountID:%s error", accountID);
            return bluebird.reject(new Error("create AccountID fail"))
        }

        var nowDate = new Date();

        var registerTime = nowDate.toLocaleString();

	    //可能sdk授权没有密码,随机一个密码
	    if(!charAccountPsw){
		    charAccountPsw = this.CreateRandPsw();
	    }

        var initData = {
                        "CharAccount":charAccount,
                        "CharAccountPsw":charAccountPsw,
                        "LoginTime":nowDate.getTime(),

                        "AccountType":accountType,
                        "IsBind":1,
                        "AccountState":0,

                        "RegisterTime":registerTime,
                        "RegisterIP":playerIP,
                        "PhoneNum":phoneNum,
                        "LoginIPList":[playerIP],
                        };
        var that = this;
        
        return this.dataMgr.CreateNewDataByKey(accountID, initData)
                            .then(function(result){

                                if(!result){
                                    that.ErrLog("CreateAccountByCharAccount(%s,%j)创建失败", accountID, initData);
                                    return null
                                }
                                that.charAccountDict[charAccount] = accountID;
                                return accountID
                            })
                            .catch(function(error){
                                that.ErrLog("CreateAccountByCharAccount(%s,%j) error:%s", accountID, initData, error.stack);
                            })

    },

    /**
     * 生成账号ID登录token
     */
    CreateAccountToken:function(accountID, psw){

        var createTick = Date.now();
        var msg = [accountID, createTick, psw].join("|");

        var cipher = crypto.createCipher("aes256", this.ShareDefine.TokenSecret);
        var token = cipher.update(msg, 'utf8', 'hex');
        token += cipher.final('hex');
        return token;
    },

    //解析token
    ParseAccountToken:function(token){

        var decipher = crypto.createDecipher("aes256", this.ShareDefine.TokenSecret);
        var dec;
        try {
            dec = decipher.update(token, 'hex', 'utf8');
            dec += decipher.final('utf8');
        } catch(err) {
            this.ErrLog("ParseAccountToken(%s) decrypt fail", token);
            return {"AccountID": 0, "CreateTick": 0, "Psw":""};
        }
        var tokenInfoList = dec.split('|');
        if(tokenInfoList.length !== 3) {
            return {"AccountID": 0, "CreateTick": 0, "Psw":""};
        }
        return {"AccountID": tokenInfoList[0], "CreateTick": Math.floor(tokenInfoList[1]), "Psw":tokenInfoList[2]};
    },


    //------------------设置接口-----------------------------
    /**
     * 设置账号属性值
     */
    SetAccountProperty:function(accountID, property, value){

        var result = this.dataMgr.SetTableProperty(accountID, property, value);

        //可能是绑定新账号
        if(result && "CharAccount" == property){
            this.charAccountDict[value] = accountID;
        }
        return result
    },
    /**
     * 保存账号数据
     */
    SaveDataByAccountID:function(accountID){
        return this.dataMgr.SaveDataByKeyID(accountID);
    },

	//-------------手机短信验证码相关-------------------
    /**
     * 设置绑定账号验证码字典数据
     */
    SetBindAccountCodeData:function(charAccount, phoneNum, code){
        this.bindAccountCodeDict[charAccount] = {
                                                "PhoneNum":phoneNum,
                                                "Code":code,
                                                "CreateTick":new Date().getTime(),
                                        };
    },

    /**
     * 设置解除绑定账号验证码字典数据
     */
    SetUnBindAccountCodeData:function(charAccount, phoneNum, code){
        this.unBindAccountCodeDict[charAccount] = {
                                                        "PhoneNum":phoneNum,
                                                        "Code":code,
                                                        "CreateTick":new Date().getTime(),
                                                }
    },

    /**
     * 删除绑定账号验证码字典数据
     */
    DeleteBindAccountCodeDictKey:function(charAccount){
        delete this.bindAccountCodeDict[charAccount];
    },

    /**
     * 删除解除绑定账号验证码字典数据
     */
    DeleteUnBindAccountCodeDictKey:function(charAccount){
        delete this.unBindAccountCodeDict[charAccount];
    },
	/**
	 * 获取绑定手机验证码字典
	 */
	GetBindAccountCodeDict:function(){
		return this.bindAccountCodeDict
	},

	GetUnBindAccountCodeDict:function(){
		return this.unBindAccountCodeDict;
	},
    //------------------获取接口-----------------------------

	//获取账号ID登录的数据信息
	GetAccountLoginSendPack:function(accountID){

		var accountInfo = this.GetAccountDataByAccountID(accountID);
		var psw = accountInfo["CharAccountPsw"];

		//创建最新的token到客户端缓存起来
		var token = this.CreateAccountToken(accountID, psw);
		this.accountTokenDict[accountID] = {"Token":token,"Psw":psw};

		var sendPack = this.HttpPackManager.GetHttpSendClientPack(0x0000);

		sendPack["AccountID"] = accountID;
		sendPack["CharAccount"] = accountInfo["CharAccount"];
		sendPack["CharAccountPsw"] = psw;
		sendPack["AccountType"] = accountInfo["AccountType"];
		sendPack["IsBind"] = accountInfo["IsBind"];
		sendPack["HeadImageUrl"] = "";
		sendPack["Token"] = token;
		sendPack["NickName"] = "";
		sendPack["Sex"] = 0;
		sendPack["SDKToken"] = "";
		sendPack["Openid"] = "";
		sendPack["Unionid"] = "";

		return sendPack
	},

	//检测账号授权token
	CheckAccountTokenResult:function(accountID, token){
		var saveTokenInfo = this.accountTokenDict[accountID];
		if(!saveTokenInfo){
			this.ErrLog("CheckAccountTokenResult(%s) not create token", accountID);
			return {"code":this.ShareDefine.KickOut_NotCreateToken}
		}
		if(saveTokenInfo["Token"] != token){
			this.ErrLog("CheckAccountTokenResult(%s,%s) token != (%j)", accountID, token, saveTokenInfo);
			return {"code":this.ShareDefine.KickOut_AccountAuthorizationFail}
		}

		var tokenInfo = this.ParseAccountToken(token);
		if(tokenInfo["AccountID"] != accountID){
			this.ErrLog("CheckAccountTokenResult(%s,%s) ParseAccountToken:%j error", accountID, token, tokenInfo);
			return {"code":this.ShareDefine.KickOut_AccountAuthorizationFail}
		}

		if(tokenInfo["Psw"] != saveTokenInfo["Psw"]){
			this.ErrLog("CheckAccountTokenResult(%j) != (%j) 密码已经修改", tokenInfo, saveTokenInfo);
			return {"code":this.ShareDefine.KickOut_AccountAuthorizationFail}
		}

		var nowTick = Date.now();
		var createTick = tokenInfo["CreateTick"];
		if(createTick + this.ShareDefine.TokenExpireTick < nowTick){
			this.ErrLog("CheckAccountTokenResult(%s,%s):%j token 过期", accountID, token, tokenInfo);
			return {"code":this.ShareDefine.KickOut_TokenExpire}
		}

		//清除掉缓存的token
		delete this.accountTokenDict[accountID];

		return {"AccountID":accountID}
	},
    /**
     * 通过账号查找账号ID列表
     */
    GetAccountIDByCharAccount:function(charAccount){
        return this.charAccountDict[charAccount];
    },

    /**
     * 获取账号属性值
     */
    GetAccountProperty:function(accountID, property){
        return this.dataMgr.GetTableProperty(accountID, property);
    },

    /**
     * 是否存在账号ID
     */
    HaveAccountByAccountID:function(accountID){
        return this.dataMgr.HaveDataByKey(accountID);
    },

    GetAccountDataByAccountID:function(accountID){
        return this.dataMgr.GetDataDictByKeyID(accountID);
    },

    /**
     * 通过条件查找账号ID列表
     */
    FindAccountIDByConditionDict:function(conditionDict, limitCount){
        return this.dataMgr.FindKeyIDListByFieldDict(conditionDict, limitCount);
    },


    /**
     * 检测账号是否合法
     */
    CheckCanUseAccount:function(account){
        return this.AccountReg.test(account)
    },

    /**
     * 检测密码合法
     * @param psw
     */
    CheckCanUsePassWord:function(psw){
        return this.PswReg.test(psw)
    },

    //------------------通知接口------------------------------

})

var g_AccountManager = null;


/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
    if(!g_AccountManager){
        g_AccountManager = new AccountManager();
    }
    return g_AccountManager;
}