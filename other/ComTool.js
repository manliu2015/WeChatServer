/*
 * 	ComTool.js
 * 	工具函数管理器模块
 *
 *	author:hongdian
 *	date:2014-10-28
 *	version:1.0
 *
 * 修改时间 修改人 修改内容:
 *
 */

var fs = require("fs");
var cryptoJS = require("crypto-js");
app.Log("import ComTool.js");


var ComTool = app.BaseClass.extend({

    /**
     * 构造函数
     */
    Init:function(){
        this.JS_Name = "ComTool";

        this.MD5PrivateKey = "com.xingyue.FashionableAnimeFight";

	    this.CharList = ["1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","m","n","r","s","t","u","v","w","x","y","z"];

        this.Log("Init");
    },

    //----------------列表方法---------------

    //删除列表重复项
    DeleteListRepeat:function(targetList){
        var returnList = [];
        var findDict = {};
        var prefix = "";

        var count = targetList.length;
        for(var index = 0; index < count; index++){
            var value = targetList[index];

            //因为findDict[222] findDict["222"]等价，所以加入string判断
            if(typeof value == "string"){
                prefix = "_str";
            }
            else{
                prefix = "";
            }
            prefix += value;
            if(!findDict[prefix]){
                returnList.push(value);
                findDict[prefix] = 1;
            }
        }
        return returnList
    },

    //第1个列表与第2个列表的交集
    TowListIntersect:function(aList, bList){
        var returnList = [];
        var aCount = aList.length;

        for(var index = 0; index < aCount; index++){
            var value = aList[index];
            if (bList.InArray(value)){
                returnList.push(value);
            }
        }
        return returnList;
    },

    //第1个列表与第2个列表的差集
    TowListSubtraction:function(aList, bList){
        var returnList = [];
        var aCount = aList.length;

        for(var index = 0; index < aCount; index++){

            var value = aList[index];
            if (!bList.InArray(value)){
                returnList.push(value);
            }
        }
        return returnList;
    },

    //2个列表的并集
    TowListUnion:function(aList, bList){
        var returnList = aList.concat(aList);
        return this.DeleteListRepeat(returnList);
    },


    //随机筛选列表指定个数出来
    ListSample:function(targetList, choiceCount){
        var returnList = [];

        //需要拷贝一份避免原列表被修改
        var tempList = targetList.slice();
        var length = tempList.length;

        //需要拷贝一份列表,避免返回列表后原列表数据被修改
        if(length <= choiceCount){
            return tempList;
        }

        for(var i=0; i<choiceCount; i++){
            var index = Math.floor(Math.random()*(length-i));
            returnList.push(tempList[index]);
            tempList.splice(index, 1);
        }
        return returnList;
    },

    //列表随机1个出来
    ListChoice:function(targetList){
        var length = targetList.length;
        if(length < 1){
            return null;
        }
        return targetList[Math.floor(Math.random()*(length))];
    },

    //求列表的最大值
    ListMaxNum:function(targetList){
        return Math.max.apply(null, targetList);
    },

    //求列表的最小值
    ListMinNum:function(targetList){
        return Math.min.apply(null, targetList);
    },
    //----------------字符串方法------------------

    //增加字符串数字后缀 ("btnFight", 1, 2)) - > "btnFight01"
    StringAddNumSuffix:function(targetString, num, suffixLen){
        var numString = "" + num;
        if(suffixLen){
            var numLen = numString.length;
            numString = numLen < suffixLen ? (Array(suffixLen - numLen + 1).join(0) + num) : numString;
        }

        return [targetString, numString].join("");
    },

    //替换字符串中的文本("第{1}次", 10)) - > "第10次"
    StringReplace:function(targetString, argList){

        var formatStr = targetString;
        var argumentsLen = argList.length;
        for(var index=1; index<=argumentsLen; index++){
            formatStr = formatStr.replace(new RegExp("\\{" + index + "\\}", "g"), argList[index-1]);
        }
        return formatStr
    },

	//去除左空格
	StringLeftTrim:function(targetString){
		return targetString.replace(/(^\s*)/g, "");
	},
	//去除右空格
	StringRightTrim:function(targetString){
		return targetString.replace(/(\s*$)/g, "");
	},
	//去除2边空格
	StringTrim:function(targetString){
		return targetString.replace(/(^\s*)|(\s*$)/g, "");
	},

    //---------------对象方法----------------
    //深拷贝(列表,字典)
    DeepCopy:function(target){
        return JSON.parse(JSON.stringify(target));
    },

    //获取字典属性值列表
    DictValues:function(target){

        var values = [];
        for(var key in target){
            values.push(target[key]);
        }
        return values
    },


	/**
     * 圆盘概率随机
     * @param curIDList
     * @param curRateList(必须是整数列表)
     * @param maxRate
     */
    GetDiskRandValue:function(curIDList, curRateList, maxRate){
    	//默认万分率随机
    	if(!maxRate){
    		maxRate = 0;
    		for(var index in curRateList){
    			var rate = curRateList[index];
    			maxRate += rate;
    		}
    	}
    	var listLength = curIDList.length
    	if(!listLength){
    		this.ErrLog("GetDiskRandValue curIDList empty");
    		return null
    	}
    	if(listLength != curRateList.length){
    		this.ErrLog("GetDiskRandValue (%s) != (%s)", curIDList, curRateList);
    		return null
    	}
    	var oddsNum = this.RandInt(1, maxRate);

    	var sortList = curRateList.map(function(rate, index){
    		var id = curIDList[index];
    		return [rate, id];
    	});
    	//从小到大排序,相等按追加顺序排序
    	sortList.sort(function(aList, bList){return aList[0]>bList[0]?1:-1})

    	var rateValue = 0;
    	for(var index=0; index<listLength; index++){
    		rateValue += sortList[index][0];
    		if(rateValue < oddsNum){
    			continue;
    		}
    		return sortList[index][1];
    	}

    	this.SysLog("curIDList:%j,%j,%s,%j not find value", curIDList, curRateList, oddsNum, sortList);

    	return null;
    },

    RandInt:function(start, end){
        return Math.floor(Math.random() * (end + 1 - start) + start);
    },

	/**
	 * 生成一个列表 range(0, 7)=>[0,1,2,3,4,5,6]
	 */
	Range:function(/*...*/){
		var start, end, step, len, returnList;
		returnList = [];
		len = arguments.length;

		//一个参数
		if (len == 1){
			start = 0;
			end = arguments[0];
			step = 1;
		}
		else if(len == 2){
			start = arguments[0];
			end = arguments[1];
			step = 1;
		}
		else{
			start = arguments[0];
			end = arguments[1];
			step = arguments[2];
		}

		if (step < 0){
			for(start; start > end; start += step){
				returnList.push(start);
			}
		}
		else{
			for(start; start < end; start += step){
				returnList.push(start);
			}

		}
		return returnList
	},

    /**
     * 获取字典数据格式字符串（支持字典嵌套）
     * @param {Object} curDict
     * @param {Number} tabNum
     * @return {String}
     */
    GetPrintDictStr:function(curDict, tabNum){
    	var key, value, classType, outEx, arg;

    	tabNum = tabNum != null ? tabNum : 0;
    	var outstr = "{\n";

    	for(key in curDict){
    		value = curDict[key];
    		classType = Object.prototype.toString.call(value).slice("[object ".length, -1);

    		outEx = "";
    		if(classType == "Object"){
    			if(value.hasOwnProperty("JS_Name")){
					outEx = "(" + value.toString() + "),\n";
				}
				else{
    				outEx = this.GetPrintDictStr(value, tabNum+1);
				}
    		}
    		else if(classType == "Function"){
    			outEx = value.constructor.name + ",\n";
    		}
    		else{
    			arg = "";
    			try{
    				arg = JSON.stringify(value);
    			}
    			catch(e){
    				//存在对象循环引用
    				arg = "### cyclic object value:" + value.toString();
    			}
    			outEx = arg + ",\n";
    		}

    		outstr += "\t" + this.GetTabStr(tabNum) + JSON.stringify(key) + ":" + outEx;
    	}

    	outstr += this.GetTabStr(tabNum) + "}";

    	if(tabNum){
    		outstr += ",";
    	}
    	outstr += "\n";

    	return outstr;
    },

    /**
     * 返回tab字符串个数
     * @param {Object} num
     * @return {String}
     */
    GetTabStr:function(num){
    	var outstr = "";
    	while(num--){
    		outstr += "\t";
    	}
    	return outstr;
    },

	/**
     * 输出类属性信息
     * @param obj
     */
    OutPutClassProperty:function(obj){
    	var propertyDict = {};
		for(var property in obj){
			propertyDict[property] = obj[property];
		}
		this.Log(this.GetPrintDictStr(propertyDict));
    },


	/**
     * 获取文件路径信息[自身路径,子文件夹列表,文件列表]
     * @param obj
     */
    GetPathInfoList:function(curPath){
		var pathDirList, pathDirCount, index, fileNameList, childDirList, pathDir;

		if(!fs.existsSync(curPath)){
			this.ErrLog("GetPathInfoList(%s) not find", curPath);
			return [curPath, [], []]
		}
		fileNameList = [];
		childDirList = [];
		pathDirList = fs.readdirSync(curPath);
		pathDirCount = pathDirList.length;

		for(index=0; index<pathDirCount; index++){
			pathDir = pathDirList[index];

			//如果不是文件
			if(pathDir.indexOf(".") === -1){
				childDirList.push(pathDir);
			}
			else{
				fileNameList.push(pathDir);
			}
		}

		return [curPath, childDirList, fileNameList];
    },

    /**
     *	获取时间天数差
     */
	GetDayDiffByTick:function(tick_1, tick_2){
        var dateTime_1, dateTime_2;

	    dateTime_1 = new Date(tick_1);
	    dateTime_2 = new Date(tick_2);

        try{
            dateTime_1 = Date.parse((dateTime_1.getMonth() + 1) + "/" + dateTime_1.getDate() + "/" + dateTime_1.getFullYear());
            dateTime_2 = Date.parse((dateTime_2.getMonth() + 1) + "/" + dateTime_2.getDate() + "/" + dateTime_2.getFullYear());
            return Math.abs(dateTime_1 - dateTime_2) / (24*60*60*1000);
        }

        catch(e){
            this.ErrLog("GetDayDiffByTick error(%s)", e.message);
        }
	},

	/**
	 * 获取当前时间字符串格式
	 * @returns {String} 2014-11-06
	 */
	GetNowDateDayStr:function(){
		var myDate = new Date();

		var year = myDate.getFullYear();
		var month = myDate.getMonth() + 1;
		var day = myDate.getDate();
		return [this.StringAddNumSuffix("", year, 4), this.StringAddNumSuffix("", month, 2), this.StringAddNumSuffix("", day, 2)].join("-");
	},

	/**
	 * 获取当前时间字符串格式
	 * @returns {String} 2014-11
	 */
	GetNowDateMonthString:function(){
		var myDate = new Date();
		var year = myDate.getFullYear();
		var month = myDate.getMonth() + 1;
		return [this.StringAddNumSuffix("", year, 4), this.StringAddNumSuffix("", month, 2)].join("-");
	},

	/**
	 * 获取当前时间字符串格式
	 * @returns {String} 2014-11-06_193844
	 */
	GetNowDateTimeStr:function(){

		var myDate = new Date();

		var year = myDate.getFullYear();
		var month = myDate.getMonth() + 1;
		var day = myDate.getDate();
		var hour = myDate.getHours();
		var min = myDate.getMinutes();
		var second = myDate.getSeconds();

		var dateString = [this.StringAddNumSuffix("", year, 4), this.StringAddNumSuffix("", month, 2), this.StringAddNumSuffix("", day, 2)].join("-");
		dateString += "_";

		dateString += [this.StringAddNumSuffix("", hour, 2), this.StringAddNumSuffix("", min, 2), this.StringAddNumSuffix("", second, 2)].join(":");

		return dateString
	},

 	/**
	 *  验证签名
	 */
	CheckMD5Sign:function(argDict, sign){
		var newSign = this.GetSign(argDict, this.MD5PrivateKey);
		if(newSign != sign){
			this.ErrLog("CheckSign(%j) (%s)!=(%s)", argDict, newSign, sign);
			return false
		}
		return true
	},

 	/**
	 *  获取签名
	 */
	GetSign:function(argDict, privateKey){
		var argKeyList = Object.keys(argDict);
		argKeyList.sort();
		var signatureStr = "";
		var count = argKeyList.length;

		for(var index=0, keyName=""; index<count; index++){
            keyName = argKeyList[index];
            signatureStr += keyName + '=' + argDict[keyName] + '&';
		}
		signatureStr += privateKey;

        return cryptoJS.MD5(signatureStr);
	},

	//获取随机字符串
	GetNonceString:function(needCount){

		//默认返回32位
		if(!needCount){
			needCount = 32;
		}
		var length = this.CharList.length;

		var stringList = [];
		for(var index=0; index<needCount; index++){
			stringList.push(this.CharList[Math.floor(Math.random()*(length))]);
		}
		return stringList.join("");
	},

});

var g_ComTool = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
    if(!g_ComTool){
        g_ComTool = new ComTool();
    }
    return g_ComTool;
}