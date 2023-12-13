// 清空上次打包内容
class CleanWebpackPlugin {
  apply(compiler) {
    // 获取打包输出的目录
    const outputpath = compiler.options.output.path
    const fs = compiler.outputFileSystem
    compiler.hooks.emit.tap("CleanWebpackPlugin", (compilation) => {
      // 删除打包目录下所有文件
      this.removeFiles(fs, outputpath)
    })
  }

  removeFiles(fs, fsFile) {
    // 先删除所有文件才能删除目录
    const files = fs.readdirSync(fsFile)
    files.forEach(file => {
      const filepath = `${fsFile}/${file}`
      // fs.statSync()方法用于同步返回给定文件路径的信息
      const fileStat = fs.statSync(file)
      if (fileStat.isDirectory()) {
        this.removeFiles(fs, fsFile)
      } else {
        fs.unlinkSync(filepath)
      }
      // fs.unlinkSync()方法用于从文件系统中同步删除文件或符号链接。
    })
  }
}

module.exports = CleanWebpackPlugin