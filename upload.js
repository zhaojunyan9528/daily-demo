const uploadFile = document.querySelector("#fileUpload")

uploadFile.onchange = async e => {
  const file = e.target.files[0]
  console.time("upfile")
  const chunks = await cutFile(file) // 获取分片结果
  console.timeEnd("upfile")
  console.log("切片：", chunks)
}

const CHUNK_SIZE = 1024 * 1024 * 5 // 5M
const THREAD_COUNT = navigator.hardwareConcurrency || 4 // 线程数量（切片运行在主线程可能会造成阻塞，可开启别的线程进行分片工作）
// 分片
async function cutFile(file) {
  // 比如 file.size :70M, chunkCount: 14  workerChunkCount: 4
  return new Promise(async (resolve, reject) => {
    const chunkCount = Math.ceil(file.size / CHUNK_SIZE) // 分片数量
    const workerChunkCount = Math.ceil(chunkCount / THREAD_COUNT) // 每个线程处理的分片数量

    console.log("切片数量", chunkCount)
    const result = []
    // 切片运行在主线程
    // for (let i = 0; i < chunkCount; i++) {
    //   const chunk = await createChunk(file, i, CHUNK_SIZE)
    //   result.push(chunk)
    // }
    // 开启其他线程去分片提高效率
    let finishWorker = 0
    for (let i = 0; i < THREAD_COUNT; i++) {
      const worker = new Worker("./worker.js", {
        type: "module"
      })
      // 每个线程起始切片和结束切片索引
      const startIndex = i * workerChunkCount // 0-4 4-8 8-12 12-14
      let endIndex = startIndex + workerChunkCount
      if (endIndex > chunkCount) {
        endIndex = chunkCount
      }
      // 发送消息
      worker.postMessage({
        file,
        CHUNK_SIZE,
        startIndex,
        endIndex
      })
      // 处理结束接受消息
      worker.onmessage = e => {
        console.log(e.data) // 数组
        // 保证切片顺序正确
        // i: index
        // 0: 0-4
        // 1: 4-8
        // 2: 8-12
        // 3: 12-14
        for (let index = startIndex; index < endIndex; index++) {
          result[index] = e.data[index - startIndex] // index - startIndex: 0 1 2 3
        }
        worker.terminate() // 收到消息后当前线程切片工作完成，结束线程
        finishWorker++
        if (finishWorker === THREAD_COUNT) {
          // 所有线程都完成
          resolve(result)
        }
      }
    }
  })
}
// 创建分片 slice截取
function createChunk(file, index, chunkSize) {
  return new Promise((resolve, reject) => {
    const start = index * chunkSize
    const end = start + chunkSize
    const fileReader = new FileReader()
    fileReader.onload = e => {
      // console.log('fileReader-onload', e.target.result)
      resolve({
        start,
        end,
        index,
        hash: e.target.result
      })
    }
    fileReader.readAsArrayBuffer(file.slice(start, end))
  })
}
