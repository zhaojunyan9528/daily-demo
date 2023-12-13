/**
 * 只能处理样式，不能处理图片资源，字体资源等，需要css-loader处理后传给style-loader use: ['../loaders/style-loader', 'css-loader']
 * 但是css-loader处理结果时js代码,style-loader需要执行js代码处理返回值再插入到页面上
 */
module.exports = function(context) {
  const script = `const style = document.createElement('style')
  style.innerHTML = ${JSON.stringify(context)}
  document.body.appendChild(style)`
  return script
}
