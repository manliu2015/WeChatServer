/*
 * 	ReadText.js
 * 	读表器
 *
 *	author:hongdian
 *	date:2014-10-28
 *	version:1.0
 *
 * 修改时间 修改人 修改内容:
 *
 *
 */

var fs = require("fs");
var path = require("path");
app.Log("import ReadText.js");


/*
 * 类方法定义
 */
var ReadText = app.BaseClass.extend({

	/**new 对象 会调用的构造函数
	 * 
	 */
	Init:function(){
		this.JS_Name = "ReadText";
		//字段key开始行
		this.FieldLine = 1;
		//有效配置开始行
		this.DataLine = 2;
		this.Log("Init");
	},

	/**
	 * 获取表的字典形式
	 * @param tableName
	 * @returns
	 */
	GetTextDict:function(tableName){

		var tablePath = path.join(app.getBase(), "res/Configs/", tableName + ".txt");
		var textDataStr = fs.readFileSync(tablePath, {encoding:"utf-8"});
		if(textDataStr){
			return this.TransformTextData(tablePath, textDataStr);
		}
		else{
			this.ErrLog("GetTextDict tablePath(%s) not find", tablePath);
			return 
		}
	},
	
	/**
	 * 转化表为字典
	 * @param tablePath
	 */
	TransformTextData:function(tablePath, textDataStr){

		var textLineDataList,textLineDataStr, lineCount, rowCount,
			textDataList, textDataStr, value, fieldNameList, 
			fieldCount,rowKey, rowDataDict, valueStr;
	
		var tableDataDict = {};
		
		textDataList = textDataStr.split("\n");
		lineCount = textDataList.length;
		if(!lineCount){
			this.ErrLog("TransformTextData(%s) not data", tablePath);
			return
		}
		for(var index_i =0; index_i<lineCount; index_i++){
			textLineDataStr = textDataList[index_i];
			textLineDataStr = textLineDataStr.replace("\r","")
			//读到最后一行，跳出
			if(!textLineDataStr){
				break
			}
			textLineDataList = textLineDataStr.split("\t");

			//如果是key行
			if(index_i === this.FieldLine){
				fieldNameList = textLineDataList;
				fieldCount = fieldNameList.length;
				continue
			}
			else if(index_i >= this.DataLine){

				rowCount = textLineDataList.length;
				if(rowCount != fieldCount){
					this.ErrLog("TransformTextData:%s,textLineDataList:%j error need(%s)", tablePath, textLineDataList, fieldCount);
					continue
				}
				rowKey = textLineDataList[0];
				rowDataDict = {};
				for(var index_j=0; index_j<rowCount; index_j++){
					valueStr = textLineDataList[index_j];
					try{
						value = this.GetTransformValue(valueStr);
					}
					catch(e){
						this.ErrLog("GetTransformValue(%s) (%s) error(%s,%s,%s)",tablePath, valueStr, e.name, e.message, e.stack);
						value = valueStr;
					}
					rowDataDict[fieldNameList[index_j]] = value;
				}
				tableDataDict[rowKey] = rowDataDict;
			}
			else{

			}
		}

		return tableDataDict
	},
	
	/**
	 * 获取value转化后的值
	 * @param value
	 * @returns
	 */
	GetTransformValue:function(valueStr){

		var startStr = valueStr[0];
		var endStr = valueStr[valueStr.length-1];
		//如果是列表
		if(startStr === "[" && endStr === "]"){
			return JSON.parse(valueStr);
		}
		else if(startStr === "{" && endStr === "}"){
			return JSON.parse(valueStr);
		}
		else if (valueStr.indexOf("return") != -1){
			return new Function(valueStr);
		}
		else{
			//去整
			var value = Number(valueStr);
			//如果不是纯数字,则为字符串
			if(isNaN(value)){
				return valueStr
			}
			else{
				return value
			}
		}


	},
})

var g_ReadText = null;


/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
    if(!g_ReadText){
        g_ReadText = new ReadText();
    }
    return g_ReadText;
}