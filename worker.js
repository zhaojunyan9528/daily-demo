onmessage = async (e) => {
  const promises = []
  const { file, CHUNK_SIZE, startIndex, endIndex } = e.data
  for (let index = startIndex; index < endIndex; index++) {
    promises.push(createChunk(file, index, CHUNK_SIZE))
  }
  const result = await Promise.all(promises)
  postMessage(result)
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