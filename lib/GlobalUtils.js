// JSBaseModule.js
// Create by manliu Nov/23/2018
// js基础模块扩展

Object.defineProperties(Array.prototype, {
    inArray: {
        // 是否可被写入
        writable: false,
        // 是否可被枚举
        enumerable: false,
        // 是否可配置
        configurable: true,
        // 判断元素是否存在列表中
        value: function(value) {
            return -1 != this.indexOf(value)
        }
    }
})

// 字典增加的方法
Object.defineProperties(Object.prototype, {
    updateValue: {
        writable: false,
        enumerable: false,
        configurable: true,
        // 一个字典扩充到另一个字典里,存在重复的key会被覆盖
        value: function(addDict) {
            for (var key in addDict) {
                this[key] = addDict[key]
            }
        }
    },

    setDefaultValue: {
        writable: false,
        enumerable: false,
        configurable: true,
        // 如果key不存在，设置字典默认值,存在返回值
        value: function(key, value) {
            if (!this.hasOwnProperty(key)) {
                this[key] = value
            }
            return this[key]
        }
    }
})

exports.GetModel = function() {
    return null
}
