// BaseClass.js
// Create by manliu
// 实现类继承接口,基类定义

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
    objects: {}
}

//
// 2) Using "extend" subclassing
// Simple JavaScript Inheritance By John Resig http://ejohn.org/
// 创建一个初始化类
var Class = function() {}

// 实现类继承接口
Class.extend = function(className, prop) {
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
            typeof prop[name] == 'function' &&
            typeof _super[name] == 'function' &&
            fnTest.test(prop[name])
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
    function Class() {
        // All construction is actually done in the init method
        if (!initializing) {
            if (this.ctor) {
                // set class name
                this.className = className

                this.ctor.apply(this, arguments)
            }
        }
    }

    var classId = ClassManager.getNewID()
    var desc = { writable: false, enumerable: false, configurable: true }
    Class.id = classId
    desc.value = classId
    Object.defineProperty(prototype, '__pid', desc)

    // Populate our constructed prototype object
    Class.prototype = prototype

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class

    // And make this class extendable
    Class.extend = arguments.callee

    // cache class
    ClassManager.objects[classId] = Class

    return Class
}

// 基类定义
var BaseClass = Class.extend('BaseClass', {
    // 构造函数
    ctor: function() {
        this.init()
    },

    // 初始化函数，所有类都应该实现该方法
    init: function() {
        throw (err = new Error('the function init is not override.'))
    },

    // 获取类名
    getName: function() {
        return this.className
    },

    // 获取类唯一性 id
    getID: function() {
        return this.__pid
    }
})

exports.BaseClass = BaseClass
