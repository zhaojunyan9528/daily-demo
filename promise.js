// 手写promise
const PENDING = 'pending'
const FULLFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  #state = PENDING // 私有属性， 仅内部使用
  #result = undefined
  #handler = [] // then可以调用多次，每调用一次，存一次
  constructor(executor) {
    const resolve = (data) => {
      this.#changeState(FULLFILLED, data)
    }
    const reject = (reason) => {
      this.#changeState(REJECTED, reason)
    }
    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }
  #changeState(state, result) {
    // console.log('changeState', state, result)
    if (this.#state !== PENDING) return // 状态一旦改变不可再更改
    this.#state = state
    this.#result = result
    this.#run() // 异步的时候这里知道什么时候改变状态
    // console.log(this.#state, this.#result)
  }
  #isPromiseLike(value) {
    return value !== null && (typeof value === 'object' || typeof value === 'function') && (typeof value.then === 'function')
  }
  #runMicroTask(callback) {
    setTimeout(callback, 0)
  }
  #runOne(callback, resolve, reject) {
    this.#runMicroTask(() => { // promise运行在微队列中
      if (typeof callback !== 'function') { // 回调不是函数
        const settled = this.#state === FULLFILLED ? resolve : reject
        settled(this.#result)
      } else { // 回调是函数
        try {
          const data = callback(this.#result)
          if (this.#isPromiseLike(data)) { // 判断是否满足promise A+规范
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
  #run() {
    // console.log('then', this.#state)
    if (this.#state === PENDING) {
      return
    }
    while(this.#handler.length) {
      const  { onFulfilled, onRejected, resolve, reject } = this.#handler.shift()
      // p.then传递参数 onFulfilled, onRejected：
      // 1.回调不是函数：p.then(null), 直接resolve， rejected
      // 2.回调是函数：函数有执行结果 p.then((res)=> {}, err => {})
      // 3.回调的函数的返回结果是promise
      if (this.#state === FULLFILLED) {
        this.#runOne(onFulfilled, resolve, reject)
      } else {
        this.#runOne(onRejected, resolve, reject)
      }
    }
  }
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
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
p.then(
  null,
  (err) => {
    console.log('promise-fail1', err)
    return 456
  }
).then(
  (res) => {
    console.log('promise-success2', res)
  },
  (err) => {
    console.log('promise-fail2', err)
  }
)
// console.log(p)



// resolve, reject 函数, 改变promise状态
// 执行期间报错，状态rejected,只能捕获同步错误
// 同步错误
// new Promise(()=> {
//   throw 123
// })
// [[Prototype]]: Promise
// [[PromiseState]]: "rejected"
// [[PromiseResult]]: 123
// 异步错误
// new Promise(()=> {
//   setTimeout(() => {
//     throw 123
//   }, 0);
// })
// [[Prototype]]: Promise
// [[PromiseState]]: "pending"
// [[PromiseResult]]: undefined

// then方法返回一个promise, then可以调用多次
// const p = new Promise((resolve, reject) => {
//   resolve(1)
// })
// p.then(
//   (res) => {},
//   (err) => {}
// )
// p.then(
//   (res) => {},
//   (err) => {}
// )