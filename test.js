const PENDING = 'pending'
const FULLFILLED = 'fulfilled'
const REJECTED = 'rejected'

// promise是一个构造函数，带有then方法
// 它有三种状态：pending 挂起，任务进行中、fulfilled 完成、rejected 失败
class MyPromise {
  #state = PENDING // 私有属性，promise初始状态pending
  #result = undefined // 私有属性，promise结果
  #handler = [] // 保存每次调用then方法的回调onFulfilled, onRejected，resolve，reject
  constructor(executor) {
    const resolve = (data) => {
      // 改变状态
      this.#changeState(FULLFILLED, data)
    }
    const reject = (reason) => {
      // 改变状态
      this.#changeState(REJECTED, reason)
    }
    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }
  #changeState(state, result) {
    if (this.#state !== PENDING) return // 状态一旦改变不可再更改
    this.#state = state
    this.#result = result
    this.#run() // 异步的时候这里知道什么时候改变状态
  }
  #isPromiseLike(value) {
    return value !== null && (typeof value === 'object' || typeof value === 'function') && (typeof value.then === 'function')
  }
  #runMicroTask(callback) {
    setTimeout(callback, 0)
  }
  #run() {
    // fulfilled、rejected、pending
    if (this.#state === PENDING) {
      return
    }
    // 遍历then方法的回调执行
    while(this.#handler.length) {
      const { onFulfilled, onRejected, resolve, reject } = this.#handler.shift()
      // p.then传递参数 onFulfilled, onRejected：
      // 1.回调不是函数：p.then(null), 直接resolve， rejected
      // 2.回调是函数：函数有执行结果 p.then((res)=> {}, err => {})
      // 3.回调的函数的返回结果是promise
      if (this.#state === FULLFILLED) {
        this.#runMicroTask(() => { // promise运行在微队列中
          // 回调不是函数
          if (typeof onFulfilled !== 'function') {
            resolve(this.#result)
          } else {
            // 回调是函数
            try {
              const data = onFulfilled(this.#result) // 回调的函数返回结果是promise
              if (this.#isPromiseLike(data)) {
                data.then(resolve, reject)
              } else {
                resolve(data)
              }
            } catch (error) {
              reject(error)
            }
          }
        })
      } else { // rejected
        this.#runMicroTask(() => { // promise运行在微队列中
          // 回调不是函数
          if (typeof onRejected !== 'function') {
            reject(this.#result)
          } else {
            // 回调是函数
            try {
              const data = onRejected(this.#result) // 回调的函数返回结果是promise
              if (this.#isPromiseLike(data)) {
                data.then(resolve, reject)
              } else {
                resolve(data)
              }
            } catch (error) {
              reject(error)
            }
          }
        })
      }
    }
  }
  // then方法接收2个参数，onFulfilled 和 onRejected 都是可选参数，它们是异步执行的
  // 可以多次对同一个promise调用then方法，从而注册多个onFulfilled或onRejected
  // then方法必须再次返回一个promise
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      // 如果是同步：状态直接是fulfilled/rejected
      // 异步：pending
      // 可多次调用、可能异步（pending）
      // 保存每次调用then方法的回调onFulfilled, onRejected，resolve，reject，等待完成即状态改变（#changeState）时调用
      this.#handler.push({
        onFulfilled,
        onRejected,
        resolve,
        reject
      })
      this.#run()
    })
  }
}
const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    reject(123)
  }, 1000)
})
// p.then(
//   null,
//   (err) => {
//     console.log('promise-fail1', err)
//     return 456
//   }
// ).then(
//   (res) => {
//     console.log('promise-success2', res)
//   },
//   (err) => {
//     console.log('promise-fail2', err)
//   }
// )
// promise-fail1 123
// promise-success2 456

p.then(
  null,
  (err) => {
    console.log('promise-fail1', err)
    throw 456
  }
).then(
  (res) => {
    console.log('promise-success2', res)
  },
  (err) => {
    console.log('promise-fail2', err)
  }
)
// promise-fail1 123
// promise-fail2 456