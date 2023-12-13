module.exports = {
  extends: ['eslint:recommended'],
  env: {
    node: true, // 启动node全局变量
    browser: true // 启用浏览器全局变量
  },
  parserOptions: {
    ecmaVersion: 6, // es6
    sourceType: "module" // es module
  },
  rules: {
    "no-var": 2 // 不能使用var定义变量
  }
}