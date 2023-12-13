const path = require('path')
const os = require('os')
const EslintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require("terser-webpack-plugin")
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin")
// const TestPlugin = require('../plugins/test-plugin') // 自定义插件
const BannerWebpackPlugin = require('../plugins/banner-webpack')
const CleanWebpackPlugin = require('../plugins/clean-webpack')

const threads = os.cpus().length // 获取cpu的核数量

function getStyleLoader(loader) {
  return [
    MiniCssExtractPlugin.loader, // 将css文件单独引入到link
    // 'style-loader', // 将css资源创建style标签添加到html文件中生效
    'css-loader', // 将css资源编译成commonjs的模块到js中
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            [
              'postcss-preset-env'
            ],
          ],
        },
      },
    },
    loader
  ].filter(Boolean)
}

module.exports = {
  entry: './src/main.js', // 相对路径
  // 输出
  output: {
    path: path.resolve(__dirname, '../dist'), // 绝对路径，__dirname当前目录的目录名
    filename: 'static/js/main.js',
    clean: false // 在每次构建前清理 /dist 文件夹
  },
  // loaders
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.css$/,
            use: getStyleLoader()
          }, // use执行顺序从右到左
          {
            test: /\.less$/,
            use: getStyleLoader('less-loader')
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoader('sass-loader')
          },
          {
            test: /\.styl$/,
            use: getStyleLoader('stylus-loader')
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
            exclude: /node_modules/,
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
          //   test: /\.js$/,
          //   use: ['./loaders/clean-log-loader']
          // } // 自定义loader
        ]
      }
    ],
  },
  // css压缩优化
  optimization: {
    minimizer: [
      // 在 webpack@5 中，你可以使用 `...` 语法来扩展现有的 minimizer（即 `terser-webpack-plugin`），将下一行取消注释
      // `...`,
      new CssMinimizerPlugin(),
      new TerserPlugin({
        parallel: threads // 开启多进程和设置多进程数量
      }) // 压缩js
    ],
  },
  // 插件
  plugins: [
    // new TestPlugin(),
    // new BannerWebpackPlugin({
    //   author: 'zjy'
    // }),
    new CleanWebpackPlugin(),
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
    }),
    new MiniCssExtractPlugin({
      filename: "static/css/main.css"
    }),
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          // Lossless optimization with custom option
          // Feel free to experiment with options for better result for you
          plugins: [
            ["gifsicle", { interlaced: true }],
            ["jpegtran", { progressive: true }],
            ["optipng", { optimizationLevel: 5 }],
            // Svgo configuration here https://github.com/svg/svgo#configuration
            [
              "svgo",
              {
                plugins: [
                  "preset-default",
                  "prefixIds"
                ],
              },
            ],
          ],
        }
      },
    })
  ],
  // 模式
  mode: 'production',
  devtool: 'source-map'
}
