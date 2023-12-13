class BannerWebpackPlugin {
  constructor(options = {}) {
    console.log(options)
    this.options = options
  }
  apply(compiler) {
    compiler.hooks.emit.tap("BannerWebpackPlugin", (compilation) => {
      // 1.获取即将输出的资源 compilation.assets
      // 2.过滤只保留css和js
      // console.log(compilation.assets)
      const assets = Object.keys(compilation.assets).filter((assets) => {
        const assetsArr = assets.split('.')
        return ['css', 'js'].includes(assetsArr[assetsArr.length -1])
      })
      // 3. 遍历css和js资源添加注释
      const prefix = `/**
* Author: ${this.options.author}
*/` 
      assets.forEach((ast) => {
        // 资源内容
        const source = compilation.assets[ast].source()
        const content = prefix + source
        compilation.assets[ast] = {
          source() {
            return content
          },
          size() {
            return content.length
          }
        }
      })
    })
  }
}

module.exports = BannerWebpackPlugin