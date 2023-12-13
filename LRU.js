// LRU：择最近最久未使用的置换
class LRUCache {
  #map;
  #length;
  constructor(length) {
    this.#map = new Map()
    this.#length = length
  }
  get(key) {
    if (!this.$map.get(key)) {
      return
    }
    const value = this.$map.get(key)
    this.#map.delete(key)
    this.#map.set(key, value)
    return value
  }
  set(key, value) {
    if (this.$map.get(key)) {
      this.#map.delete(key)
    }
    this.#map.set(key, value)
    if (this.#map.size > this.#length) {
      const firstkey = this.#map.keys().next().value
      this.#map.delete(firstkey)
    }
  }
}