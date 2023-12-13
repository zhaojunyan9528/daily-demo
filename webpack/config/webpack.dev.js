const path = require('path')
const os = require('os')

const EslintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const threads = os.cpus().length // 获取cpu的核数量

module.exports = {
  entry: './src/main.js', // 相对路径
  // 输出
  output: {
    // 开发模式下可以path:undefined
    path: path.resolve(__dirname, '../dist'), // 绝对路径，__dirname当前目录的目录名
    filename: 'main.js',
    clean: true // 在每次构建前清理 /dist 文件夹
  },
  // loaders
  module: {
    rules: [
      {
        // 每个文件只能被一个loader配置处理
        oneOf: [
          {
            test: /\.css$/,
            use: [
            'style-loader', // 将css资源创建style标签添加到html文件中生效
            'css-loader', // 将css资源编译成commonjs的模块到js中
            'less-loader'
            ]
          }, // use执行顺序从右到左
          {
            test: /\.less$/,
            use: [
              // compiles Less to CSS
              'style-loader',
              'css-loader',
              'less-loader',
            ],
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              // 将 JS 字符串生成为 style 节点
              'style-loader',
              // 将 CSS 转化成 CommonJS 模块
              'css-loader',
              // 将 Sass 编译成 CSS
              'sass-loader',
            ],
          },
          {
            test: /\.styl$/,
            use: [
              // 将 JS 字符串生成为 style 节点
              'style-loader',
              // 将 CSS 转化成 CommonJS 模块
              'css-loader',
              // 将 stylus 编译成 CSS
              'stylus-loader',
            ],
          },
          {
            test: /\.(png|jpg|webp|svg|jpeg)$/,
            type: 'asset', //asset通用资源类型  自动地在 resource 和 inline 之间进行选择：
            // 小于 8kb 的文件，将会视为 inline 模块类型，否则会被视为 resource 模块类型。
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024 // 8kb
              }
            },
            generator: {
              filename: 'static/images/[hash][ext][query]' // 输出文件名,将某些资源发送到指定目录：
            }
          },
          {
            test: /\.(ttf|woff|woff2)$/, // 字体资源
            type: 'asset/resource',
            generator: {
              filename: 'static/media/[hash][ext][query]'
            }
          },
          {
            test: /\.js$/,
            exclude: /node_modules/, // 排除node_modules文件
            use: [
              {
                loader: 'thread-loader',
                options: {
                  works: threads // 进程数量
                }
              },
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true, // 开启babel缓存
                  cacheCompression: false, // 关闭缓存文件压缩
                  plugins: ["@babel/plugin-transform-runtime"] // 减少代码体积
                }
              }
            ]
          },
          // {
          //   test: /\.css$/,
          //   use: ['../loaders/style-loader', 'css-loader'] // 使用自定义style-loader
          // }
        ]
      }
    ]
  },
  // 插件
  plugins: [
    new EslintPlugin({
      // 指定文件根目录，类型为字符串,检测哪些文件
      context: path.resolve(__dirname, '../src'),
      exclude: "node_modules",
      cache: true, // 开启缓存
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache/eslint-webpack-plugin/.eslintcache'),
      threads // 开启多进程和设置多进程数量
    }),
    new HtmlWebpackPlugin({
      // 以public/index.html为模版，自动引入bundles到body的script
      template: path.resolve(__dirname, '../public/index.html')
    })
  ],
  // 模式
  mode: 'development',
  // 开发服务器 不会输出资源，在内存中编译
  devServer: {
    host: "localhost",
    port: 3000,
    open: true,
    hot: true // 热更新
  },
  devtool: 'cheap-module-source-map'
}