const { setTimeout } = require("timers/promises")

/**
 * webpack会加载配置文件和命令语句初始化参数，生成compoliler对象，加载配置的插件
 * 变量所有插件，调用的插件的apply方法
 * 开始编译（触发各个hooks钩子事件）
 */
class TestPlugin {
  constructor() {
    console.log('testPlugin constructor')
  }
  apply (compiler) {
    console.log('testPlugin apply')
    compiler.hooks.environment.tap("TestPlugin", function() {
      console.log('TestPlugin environment')
    })
    compiler.hooks.emit.tap('TestPlugin', () => {
      console.log('TestPlugin emit 1')
    })
    // compiler.hooks.emit.tapAsync('TestPlugin', (compilation, callback) => {
    //   setTimeout(() => {
    //     console.log('TestPlugin emit2 async')
    //     callback()
    //   }, 2000)
    // })
    // compiler.hooks.emit.tapPromise('TestPlugin', (compilation) => {
    //   return new Promise((resolve) => {
    //     setTimeout(() => {
    //       console.log('TestPlugin emit3 promise')
    //       resolve()
    //     }, 3000)
    //   })
    // })
  }
}
// testPlugin constructor
// testPlugin apply
module.exports = TestPlugin