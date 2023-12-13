// 判断五子棋输赢

const BLACK = 1
const WHITE = 2

// 判断是否赢，从横、纵、斜、反斜四个方向判断是否连续5个同颜色
function isWin(board, point, color) {
  return horiJudgement(board, point, color) || verJudgement(board, point, color)
    || slashJudgement(board, point, color) || backslashJudgement(board, point, color)
}
// 横向
const horiJudgement = createJudgement(
  ([i,j])=> [i-1, j], // 当前点左/右移一位
  ([i,j])=> [i+1, j]
)
// 纵向
const verJudgement = createJudgement(
  ([i,j])=> [i, j-1], // 当前点上/下移一位
  ([i,j])=> [i, j+1]
)
// 斜向
const slashJudgement = createJudgement(
  ([i,j])=> [i-1, j-1], // 当前点斜上/下移一位
  ([i,j])=> [i+1, j+1]
)
// 反斜向
const backslashJudgement = createJudgement(
  ([i,j])=> [i+1, j-1], // 当前点斜上/下移一位
  ([i,j])=> [i-1, j+1]
)

// 判断该点是否有效：
// 在棋盘内
// 有棋子和落子同色
function isValid(board, point, color) {
  const ROWS = board.length
  const COLS = board[0].length
  const [i, j] = point
  return (i >= 0 && i < ROWS && j >= 0 && j < COLS && board[i][j] === color)
}
function createJudgement(p1movement, p2movement) {
  return function(board, point, color) {
    let count = 1
    let p1 = p1movement(point)
    let p2 = p2movement(point)
    while(1) {
      let p1changed = false, p2changed = false
      if (isValid(board, p1, color)) {
        p1changed = true
        p1 = p1movement(point)
        count++
      }
      if (isValid(board, p2, color)) {
        p2changed = true
        p2 = p2movement(p2)
        count++
      }
      if (count >= 5) return true
      if (!p1changed && !p2changed) { // p1,p2都是无效的
        return false
      }
    }
  }
}