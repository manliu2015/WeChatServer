/*
 * 	SysDataManager.js
 * 	2维表管理器
 * 
 *	author:hongdian
 *	date:2014-10-28
 *	version:1.0
 *
 * 修改时间 修改人 修改内容:
 * 
 *
 */

app.Log("import SysDataManager.js");
/**
 * 使用范例
 * 	var a = this.SysDataManager.GetTableDict("BossFBInfo", ["FBType", "FBLv"]); // param2：联合多个字段作为字典key
 	var type = a["1_2"]["FBType"];
 */
/**
 * 类方法
 */
var SysDataManager = app.BaseClass.extend({
	
	Init:function(){
		this.JS_Name = "SysDataManager";
		this.ReadText = app.ReadText();
		this.tableDict = {};
		this.Log("Init");
	},
		
	/**
	 * 获取表字典数据
	 * @param tableName:表名
	 * @param keyList：联合表key列表
	 * @returns
	 */
	GetTableDict:function(tableName, keyList){
		//如果表为读取，则读取
		if (!this.tableDict[tableName]){
			if (!this.AddTable(tableName, keyList)){
				this.ErrLog("AddTable (%s, %j) fail!",tableName, keyList);
				return {}
			};
		}
		
		return this.tableDict[tableName]
	},

	/**
	 * 读取表数据
	 * @param tableName
	 * @param keyNameList
	 * @returns {Boolean}
	 */
	AddTable:function(tableName, keyNameList){
		
		var readTableInfo = this.ReadText.GetTextDict(tableName)
		if (!readTableInfo){
			this.ErrLog("AddTable(%s) not find table", tableName);
			return false
		}
		var tableInfo = {};
		//属性配置表,需要转化格式
		if(tableName == "PropertyInfo"){
			for(var property in readTableInfo){
				tableInfo[property] = readTableInfo[property]["Value"]
			}
		}
		//如果有指定列表key
		else if(keyNameList){
			for (var key in readTableInfo){
				var valueDict = readTableInfo[key];

				var useKeyName = this.GetKeyNameStr(keyNameList, valueDict);
				if (!useKeyName){
					this.ErrLog("AddTable(%s) GetKeyNameStr(%j, %j) fail", tableName, keyNameList, valueDict);
					continue
				}
				
				if(tableInfo.hasOwnProperty(useKeyName)){
					this.ErrLog("AddTable 表(%s)存在重复的联合key(%s)", tableName, useKeyName);
					continue
					
				}
				tableInfo[useKeyName] = valueDict;
			}
			
		}
		//不是联合key表直接赋值
		else{
			tableInfo = readTableInfo;
		}
		
		this.tableDict[tableName] = tableInfo;
		
		return true
	},

	// 重载表数据	
	ReloadTable:function(tableName, keyNameList){

		var tableInfo = this.tableDict[tableName];
		//如果没有表数据,则直接读取
		if(!tableInfo){
			this.AddTable(tableName, keyNameList);
			return true
		}

		var readTableInfo = this.ReadText.GetTextDict(tableName)
		if (!readTableInfo){
			this.ErrLog("ReloadTable(%s) not find table", tableName);
			return false
		}

		//如果存在表数据需要清空原来的
		var keyList = Object.keys(tableInfo);
		var count = keyList.length;
		for(var index=0; index<count; index++){
			var keyName = keyList[index];
			delete tableInfo[keyName];
		}

		//属性配置表,需要转化格式
		if(tableName == "PropertyInfo"){
			for(var property in readTableInfo){
				tableInfo[property] = readTableInfo[property]["Value"]
			}
		}
		//如果有指定列表key
		else if(keyNameList){
			for (var key in readTableInfo){
				var valueDict = readTableInfo[key];

				var useKeyName = this.GetKeyNameStr(keyNameList, valueDict);
				if (!useKeyName){
					this.ErrLog("ReloadTable(%s) GetKeyNameStr(%j, %j) fail", tableName, keyNameList, valueDict);
					continue
				}
				
				if(tableInfo.hasOwnProperty(useKeyName)){
					this.ErrLog("ReloadTable表(%s)存在重复的联合key(%s)", tableName, useKeyName);
					continue
					
				}
				tableInfo[useKeyName] = valueDict;
			}
			
		}
		//不是联合key表直接赋值
		else{
			tableInfo = readTableInfo;
		}
		
		return true
	},
	/**
	 * 删除表
	 */
	DeleteTable:function(tableName){
		delete this.tableDict[tableName];
	},
	
	/**
	 * 获取表字段名对应联合表key字符串
	 */
	GetKeyNameStr:function(keyNameList, valueDict){
		
		var keyValueList = [];

		var count = keyNameList.length;

		//构建联合表key 字符串
		for(var index = 0; index < count; index++){
			var keyName = keyNameList[index];
			if (!valueDict.hasOwnProperty(keyName)){
				this.ErrLog("GetKeyNameStr valueDict(%j) dont have keyName(%s)", valueDict, keyName);
				return null
			}

			keyValueList.push(valueDict[keyName]);
	
		}
		return keyValueList.join("_")
	},
	
	//--------------------------联合key接口--------------------------------
	
	/**
	 * 获取联合表keylist 对应的keystr
	 * @param keyList
	 * @returns
	 */
	GetMuchKeyStr:function(keyList){
		return keyList.join("_")
	},
	
	/**
	 * 表数据输出
	 */
	DebugOutput:function(){
		this.ErrLog("DebugOutput:%s", this.tableDict);
		
	}

})

//实例
var g_SysDataManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
    if(!g_SysDataManager){
        g_SysDataManager = new SysDataManager();
    }
    return g_SysDataManager;
}