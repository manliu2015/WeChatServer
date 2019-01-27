// BaseClass.js
// Create by manliu
// 实现类继承接口,基类定义

var util = require('util')

// 类管理器器
var ClassManager = {
    id: 0 | (Math.random() * 998),

    instanceId: 0 | (Math.random() * 998),

    // 新的对象 id
    getNewID: function() {
        return ++this.id
    },

    getNewInstanceId: function() {
        return ++this.instanceId
    },

    // 所有对象
    objects: {},

    // 所有类对象
    classes: {},

    // 所有单例
    singleObjects: {}
}

var objects = ClassManager.objects
var classes = ClassManager.classes
var singleObjects = ClassManager.singleObjects

//
// 2) Using "extend" subclassing
// Simple JavaScript Inheritance By John Resig http://ejohn.org/
// 创建一个初始化类
var Class = function() {}

// 实现类继承接口
Class.extend = function(prop) {
    if (typeof prop !== 'object' && typeof prop !== 'function') {
        // error prop
        throw (err = new Error('fail in Class define.'))
    }

    var _super = this.prototype

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    var initializing = true
    var prototype = Object.create(_super)
    initializing = false
    var fnTest = /xyz/.test(function() {
        xyz
    })
        ? /\b_super\b/
        : /.*/

    // Copy the properties over onto the new prototype
    for (var name in prop) {
        // Check if we're overwriting an existing function
        prototype[name] =
            typeof prop[name] == 'function' && typeof _super[name] == 'function' && fnTest.test(prop[name])
                ? (function(name, fn) {
                      return function() {
                          var tmp = this._super

                          // Add a new ._super() method that is the same method
                          // but on the super-class
                          this._super = _super[name]

                          // The method only need to be bound temporarily, so we
                          // remove it when we're done executing
                          var ret = fn.apply(this, arguments)
                          this._super = tmp

                          return ret
                      }
                  })(name, prop[name])
                : prop[name]
    }

    // The dummy class constructor
    var newClass = function() {
        // All construction is actually done in the init method
        if (!initializing) {
            this.__instanceId = ClassManager.getNewInstanceId()
            this.ctor && this.ctor.apply(this, arguments)

            // cache intance object
            objects[this.__instanceId] = this
        }
    }

    var classId = ClassManager.getNewID()
    var desc = { writable: false, enumerable: false, configurable: true }
    Class.id = classId
    desc.value = classId
    Object.defineProperty(prototype, '__pid', desc)

    // Populate our constructed prototype object
    newClass.prototype = prototype

    // Enforce the constructor to be what we expect
    newClass.prototype.constructor = Class

    // cache class
    classes[classId] = newClass

    return newClass
}

Class.extendEx = function(className, prop) {
    var newClass = Class.extend.call(this, prop)

    // And make this class extendable
    newClass.extend = arguments.callee
    newClass.className = className
    return newClass
}

Class.single = function(className, prop) {
    var newClass = Class.extend.call(this, prop)

    // make single class
    newClass.getInstance = function() {
        if (!singleObjects[className]) {
            singleObjects[className] = new newClass()
        }

        return singleObjects[className]
    }

    // And make this class extendable
    newClass.extend = arguments.callee.bind(newClass)
    newClass.className = className
    newClass.prototype.className = className
    return newClass
}

// 基类定义
var BaseClass = Class.extendEx('BaseClass', {
    // 构造函数
    ctor: function() {
        this.init()
    },

    // 初始化函数，所有类都应该实现该方法
    init: function() {
        throw new Error('the function init is not override.')
    },

    // 获取类名
    getName: function() {
        return this.className
    },

    // 获取类唯一性 id
    getID: function() {
        return this.__instanceId
    },

    // 获取类 id
    getClassId: function() {
        return this.__pid
    }
})

// 单例类定义
var SingleClass = Class.single('SingleClass', {
    // 构造函数
    ctor: function() {
        this.init()
    },

    // 初始化函数，所有类都应该实现该方法
    init: function() {
        throw new Error('the function init is not override.')
    },

    // 获取类名
    getName: function() {
        return this.className
    },

    // 获取类唯一性 id
    getID: function() {
        return this.__pid
    },

    // 获取类 id
    getClassId: function() {
        return this.__pid
    },

    // log
    I: function() {
        if (isDevelop) {
            var logText = util.format.apply(null, arguments)
            logger.logger.debug(['[', this.getName(), '] ', logText].join(''))
        }
    },

    // 警告 log
    W: function() {
        var logText = util.format.apply(null, arguments)
        logger.logger.warn(['[', this.getName(), '] ', '###', logText].join(''))
    },

    // 错误 log
    E: function() {
        var logText = util.format.apply(null, arguments)
        logger.loggerError.error(['[', this.getName(), '] ', '###', logText].join(''))
    },

    // 一些关键消息的输出log
    S: function() {
        var logText = util.format.apply(null, arguments)
        logger.logger.debug(['[', this.getName(), '] ', logText].join(''))
    }
})

exports.BaseClass = BaseClass
exports.SingleClass = SingleClass
