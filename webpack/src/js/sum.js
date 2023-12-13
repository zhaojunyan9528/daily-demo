export default function sum(...args) {
  return [...args].reduce((p, v) => p + v, 0)
}